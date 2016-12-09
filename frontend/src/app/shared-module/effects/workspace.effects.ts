/**
 * Copyright (C) 2016 Linagora
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// angular modules
import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Router } from '@angular/router';

// rxjs
import { Observable, Subscription } from 'rxjs';

// ngrx
import { Store, Action } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';

// sse
import IOnMessageEvent = sse.IOnMessageEvent;

// our environment
import { environment } from '../../../environments/environment';

// our services
import { WorkspaceService } from '../services/workspace.service';
import { SseService } from '../services/sse.service';

// our interfaces
import { IStore } from '../interfaces/store.interface';
import { IWorkspaceRecord } from '../interfaces/workspace.interface';

// our actions
import { WorkspaceActions } from '../reducers/workspace.actions';

@Injectable()
export class WorkspaceEffects {
  private sseServiceSub: Subscription;

  constructor(
    private actions$: Actions,
    private store$: Store<IStore>,
    private workspaceService: WorkspaceService,
    private router: Router,
    private sseService: SseService
  ) { }

  // tslint:disable-next-line:member-ordering
  @Effect({dispatch: true}) fetchWorkspace$: Observable<Action> = this.actions$
    .ofType(WorkspaceActions.FETCH_WORKSPACE)
    .switchMap((action: Action) => this.workspaceService.updateWorkspace(action.payload)
      .map((res: Response) => {
        if (!res.ok) {
          throw new Error(`Error while fetching workspace with ID : ${action.payload}`);
        }

        let r = res.json();

        // TODO factor with similar code in workspace.reducer.ts
        r.busesInProgress = r.busesInProgress.map(b => {
          return {
            id: b.id,
            config: {
              ip: b.importIp,
              port: parseInt(`${action.payload.importPort}`, 10),
              login: b.importUsername,
              password: '',
              passphrase: ''
            },
            importError: b.importError
          };
        });

        return {
          type: WorkspaceActions.FETCH_WORKSPACE_SUCCESS,
          payload: {
            id: action.payload,
            data: r
          }
        };
      })
      .catch((err) => {
        if (environment.debug) {
          console.error(err);
        }

        return Observable.of({ type: WorkspaceActions.FETCH_WORKSPACE_FAILED });
      })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({dispatch: true}) fetchWorkspaceSuccess$: Observable<Action> = this.actions$
    .ofType(WorkspaceActions.FETCH_WORKSPACE_SUCCESS)
    .switchMap((action: Action) => {
      if (typeof this.sseServiceSub !== 'undefined') {
        this.sseServiceSub.unsubscribe();
      }

      this.router.navigate(['/cockpit', 'workspaces', action.payload.id]);

      let sseServiceObs: Observable<Action> =
        this.sseService.subscribeToMessage(action.payload.id)
          .map((msg: IOnMessageEvent) => {
            if (msg.event === 'BUS_IMPORT_OK') {
              return { type: WorkspaceActions.ADD_BUS_SUCCESS, payload: msg.data };
            }
            else if (msg.event === 'BUS_IMPORT_ERROR') {
              return { type: WorkspaceActions.ADD_BUS_FAILED, payload: msg.data };
            }
            else {
              return { type: '', payload: null };
            }
          });

      return sseServiceObs;
    });

  // tslint:disable-next-line:member-ordering
  // TODO: This effect needs a review
  @Effect({dispatch: true}) importBus$: Observable<Action> = this.actions$
    .ofType(WorkspaceActions.IMPORT_BUS)
    .withLatestFrom(this.store$.select('workspace'))
    .switchMap(([action, workspaceR]: [Action, IWorkspaceRecord]) => this.workspaceService.importBus(workspaceR.get('id'), action.payload)
      .map((res: Response) => {
        if (!res.ok) {
          throw new Error('Error while importing the bus');
        }

        // at this point, the server has only returned an ID + the previous information
        // sent to create the bus. Save it so we can display the bus into importing list
        return { type: WorkspaceActions.IMPORT_BUS_MINIMAL_CONFIG, payload: Object.assign(res.json(), action.payload) };
      })
      .catch((err) => {
        if (environment.debug) {
          console.error(err);
        }
        return Observable.of({ type: WorkspaceActions.IMPORT_BUS_FAILED });
      })
    );

  // tslint:disable-next-line:member-ordering
  // TODO: This effect needs a review
  @Effect({dispatch: false}) importBusMinimalConfig$ = this.actions$
    .ofType(WorkspaceActions.IMPORT_BUS_MINIMAL_CONFIG)
    .withLatestFrom(this.store$.select('workspace'))
    .map(([action, workspaceR]: [Action, IWorkspaceRecord]) => {
      this.router.navigate([
        '/cockpit',
        'workspaces',
        workspaceR.get('id'),
        'petals',
        'bus',
        action.payload.id
      ]);
    });

  // tslint:disable-next-line:member-ordering
  // TODO: This effect needs a review
  // @Effect({dispatch: true}) fetchBusConfig$: Observable<Action> = this.actions$
  //   .ofType(WorkspaceActions.FETCH_BUS_CONFIG)
  //   .switchMap(action => this.workspaceService.getBusConfig()
  //     .map((res: Response) => {
  //       if (!res.ok) {
  //         throw new Error('Error while getting the bus');
  //       }

  //       let config: any = res.json();

  //       return { type: WorkspaceActions.FETCH_BUS_CONFIG_SUCCESS, payload: { idBus: action.payload, config } };
  //     })
  //     .catch((err) => {
  //       if (environment.debug) {
  //         console.error(err);
  //       }
  //       return Observable.of({ type: WorkspaceActions.FETCH_BUS_CONFIG_FAILED });
  //     })
  //   );

  // tslint:disable-next-line:member-ordering
  @Effect({dispatch: true}) removeBus$: Observable<Action> = this.actions$
    .ofType(WorkspaceActions.REMOVE_BUS)
    .withLatestFrom(this.store$.select('workspace'))
    .switchMap(([action, workspace]: [Action, IWorkspaceRecord]) => this.workspaceService.removeBus(workspace.get('id'), action.payload)
      .map((res: Response) => {
        if (!res.ok) {
          throw new Error('Error while removing the bus');
        }

        this.router.navigate(['/cockpit', 'workspaces', workspace.get('id')]);

        return { type: WorkspaceActions.REMOVE_BUS_SUCCESS, payload: { idWorkspace: workspace.get('id'), idBus: action.payload } };
      })
      .catch((err) => {
        if (environment.debug) {
          console.error(err);
        }
        return Observable.of({ type: WorkspaceActions.REMOVE_BUS_FAILED });
      })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({dispatch: true}) fetchBusDetails$: Observable<Action> = this.actions$
    .ofType(WorkspaceActions.FETCH_BUS_DETAILS)
    .switchMap((action: Action) => this.workspaceService.getDetailsBus(action.payload.idWorkspace, action.payload.idBus)
      .map((res: Response) => {
        if (!res.ok) {
          throw new Error('Error while fetching the bus details');
        }

        return { type: WorkspaceActions.FETCH_BUS_DETAILS_SUCCESS, payload: res.json() };
      })
      .catch((err) => {
        if (environment.debug) {
          console.error(err);
        }

        return Observable.of({
          type: WorkspaceActions.FETCH_BUS_DETAILS_FAILED,
          payload: { idBus: action.payload.idBus }
        });
      })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({dispatch: true}) fetchContainerDetails$: Observable<Action> = this.actions$
    .ofType(WorkspaceActions.FETCH_CONTAINER_DETAILS)
    .switchMap((action: Action) =>
      this.workspaceService.getDetailsContainer(action.payload.idWorkspace, action.payload.idBus, action.payload.idContainer)
      .map((res: Response) => {
        if (!res.ok) {
          throw new Error('Error while fetching the bus details');
        }

        return { type: WorkspaceActions.FETCH_CONTAINER_DETAILS_SUCCESS, payload: {
          bus: {
            id: action.payload.idBus,
            container: res.json()
          }
        }};
      })
      .catch((err) => {
        if (environment.debug) {
          console.error(err);
        }

        return Observable.of({
          type: WorkspaceActions.FETCH_CONTAINER_DETAILS_FAILED,
          payload: { idBus: action.payload.idBus, idContainer: action.payload.idContainer }
        });
      })
    );
}
