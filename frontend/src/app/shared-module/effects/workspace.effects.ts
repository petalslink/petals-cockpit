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
  FETCH_BUS_CONFIG_FAILED, ADD_BUS
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

      let sseServiceObs: Observable<Action> =
        this.sseService.subscribeToMessage(action.payload)
          .map((msg: IOnMessageEvent) => {
            if (msg.event === 'BUS_IMPORT_OK') {
              return { type: ADD_BUS, payload: msg.data };
            }
            else if (msg.event === 'BUS_IMPORT_ERROR') {
              // TODO
              return { type: '', payload: null };
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
    .switchMap(action => this.workspaceService.importBus(action.payload)
      .map((res: Response) => {
        if (!res.ok) {
          throw new Error('Error while importing the bus');
        }

        // at this point, the server has only returned an ID + the previous information
        // sent to create the bus. Save it so we can display the bus into importing list
        return { type: IMPORT_BUS_MINIMAL_CONFIG, payload: res.json() };
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
}
