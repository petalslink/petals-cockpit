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
import {
  FETCH_WORKSPACE,
  FETCH_WORKSPACE_SUCCESS,
  FETCH_WORKSPACE_FAILED,
  IMPORT_BUS,
  IMPORT_BUS_FAILED,
  IMPORT_BUS_MINIMAL_CONFIG,
  FETCH_BUS_CONFIG,
  FETCH_BUS_CONFIG_SUCCESS,
  FETCH_BUS_CONFIG_FAILED,
  ADD_BUS_SUCCESS,
  ADD_BUS_FAILED,
  REMOVE_BUS,
  REMOVE_BUS_SUCCESS,
  REMOVE_BUS_FAILED
} from '../reducers/workspace.reducer';

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
    .ofType(FETCH_WORKSPACE)
    .switchMap((action: Action) => this.workspaceService.updateWorkspace(action.payload)
      .map((res: Response) => {
        if (!res.ok) {
          throw new Error(`Error while fetching workspace with ID : ${action.payload}`);
        }

        return {
          type: FETCH_WORKSPACE_SUCCESS,
          payload: {
            id: action.payload,
            data: res.json()
          }
        };
      })
      .catch((err) => {
        if (environment.debug) {
          console.error(err);
        }

        return Observable.of({ type: FETCH_WORKSPACE_FAILED });
      })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({dispatch: true}) fetchWorkspaceSuccess$: Observable<Action> = this.actions$
    .ofType(FETCH_WORKSPACE_SUCCESS)
    .switchMap((action: Action) => {
      if (typeof this.sseServiceSub !== 'undefined') {
        this.sseServiceSub.unsubscribe();
      }

      this.router.navigate(['/cockpit', 'workspaces', action.payload.id]);

      let sseServiceObs: Observable<Action> =
        this.sseService.subscribeToMessage(action.payload.id)
          .map((msg: IOnMessageEvent) => {
            if (msg.event === 'BUS_IMPORT_OK') {
              return { type: ADD_BUS_SUCCESS, payload: msg.data };
            }
            else if (msg.event === 'BUS_IMPORT_ERROR') {
              return { type: ADD_BUS_FAILED, payload: { idBus: msg.data.id, errorMsg: msg.data.error } };
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
    .ofType(IMPORT_BUS)
    .withLatestFrom(this.store$.select('workspace'))
    .switchMap(([action, workspaceR]: [Action, IWorkspaceRecord]) => this.workspaceService.importBus(workspaceR.get('id'), action.payload)
      .map((res: Response) => {
        if (!res.ok) {
          throw new Error('Error while importing the bus');
        }

        // at this point, the server has only returned an ID + the previous information
        // sent to create the bus. Save it so we can display the bus into importing list
        return { type: IMPORT_BUS_MINIMAL_CONFIG, payload: Object.assign(res.json(), action.payload) };
      })
      .catch((err) => {
        if (environment.debug) {
          console.error(err);
        }
        return Observable.of({ type: IMPORT_BUS_FAILED });
      })
    );

  // tslint:disable-next-line:member-ordering
  // TODO: This effect needs a review
  @Effect({dispatch: false}) importBusMinimalConfig$ = this.actions$
    .ofType(IMPORT_BUS_MINIMAL_CONFIG)
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
  @Effect({dispatch: true}) fetchBusConfig$: Observable<Action> = this.actions$
    .ofType(FETCH_BUS_CONFIG)
    .switchMap(action => this.workspaceService.getBusConfig()
      .map((res: Response) => {
        if (!res.ok) {
          throw new Error('Error while getting the bus');
        }

        let config: any = res.json();

        return { type: FETCH_BUS_CONFIG_SUCCESS, payload: { idBus: action.payload, config } };
      })
      .catch((err) => {
        if (environment.debug) {
          console.error(err);
        }
        return Observable.of({ type: FETCH_BUS_CONFIG_FAILED });
      })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({dispatch: true}) removeBus$: Observable<Action> = this.actions$
    .ofType(REMOVE_BUS)
    .withLatestFrom(this.store$.select('workspace'))
    .switchMap(([action, workspace]: [Action, IWorkspaceRecord]) => this.workspaceService.removeBus(workspace.get('id'), action.payload)
      .map((res: Response) => {
        if (!res.ok) {
          throw new Error('Error while removing the bus');
        }

        this.router.navigate(['/cockpit', 'workspaces', workspace.get('id')]);

        return { type: REMOVE_BUS_SUCCESS, payload: { idWorkspace: workspace.get('id'), idBus: action.payload } };
      })
      .catch((err) => {
        if (environment.debug) {
          console.error(err);
        }
        return Observable.of({ type: REMOVE_BUS_FAILED });
      })
    );
}
