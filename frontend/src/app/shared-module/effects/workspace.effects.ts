// angular modules
import { Injectable, OnDestroy } from '@angular/core';
import { Response } from '@angular/http';
import { Router } from '@angular/router';

// rxjs
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

// store
import { Store, Action } from '@ngrx/store';
import { Actions, Effect, mergeEffects } from '@ngrx/effects';

// our environment
import { environment } from '../../../environments/environment';

// our states
import { AppState } from '../../app.state';
import { WorkspacesStateRecord, WorkspacesState } from '../reducers/workspaces.state';

// our services
import { WorkspaceService } from '../services/workspace.service';
import { SseService } from '../services/sse.service';

// our interfaces
import { IWorkspace } from '../interfaces/workspace.interface';

// our actions
import {
  FETCHING_WORKSPACES,
  FETCHING_WORKSPACES_FAILED,
  WORKSPACES_FETCHED,
  IMPORTING_BUS,
  IMPORTING_BUS_FAILED,
  FETCHING_BUS_CONFIG_SUCCESS,
  FETCHING_BUS_CONFIG,
  FETCHING_BUS_CONFIG_FAILED,
  IMPORTING_BUS_MINIMAL_CONFIG,
  CHANGE_SELECTED_WORKSPACE,
  ADD_BUS
} from '../reducers/workspaces.reducer';

@Injectable()
export class WorkspaceEffects implements OnDestroy {
  // our subscription(s) to @ngrx/effects
  private subscription: Subscription;
  private workspaces$: Observable<WorkspacesState>;

  constructor(
    private actions$: Actions,
    private store$: Store<AppState>,
    private workspaceService: WorkspaceService,
    private router: Router,
    private sseService: SseService
  ) {
    this.subscription = mergeEffects(this).subscribe(store$);
    this.workspaces$ = <Observable<WorkspacesStateRecord>>this.store$.select('workspaces');
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  // tslint:disable-next-line:member-ordering
  @Effect({dispatch: true}) changeSelectedWorkspace$: Observable<Action> = this.actions$
    .ofType(CHANGE_SELECTED_WORKSPACE)
    .filter(action => typeof action.payload !== 'undefined')
    .switchMap(action =>
        this.sseService.subscribeToMessage(action.payload)
        .map(msg => {
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
        })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({dispatch: true}) fetchingWorkspaces$: Observable<Action> = this.actions$
    .ofType(FETCHING_WORKSPACES)
    .switchMap(action => this.workspaceService.updateWorkspaces()
      .map((res: Response) => {
        if (!res.ok) {
          throw new Error('Error while fetching workspaces');
        }

        let workspaces: Array<IWorkspace> = res.json();

        return { type: WORKSPACES_FETCHED, payload: workspaces };
      })
      .catch((err) => {
        if (environment.debug) {
          console.error(err);
        }

        return Observable.of({ type: FETCHING_WORKSPACES_FAILED });
      })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({dispatch: true}) importingBus$: Observable<Action> = this.actions$
    .ofType(IMPORTING_BUS)
    .switchMap(action => this.workspaceService.importBus(action.payload)
      .map((res: Response) => {
        if (!res.ok) {
          throw new Error('Error while importing the bus');
        }

        // at this point, the server has only returned an ID + the previous information
        // sent to create the bus. Save it so we can display the bus into importing list
        return { type: 'IMPORTING_BUS_MINIMAL_CONFIG', payload: res.json() };

      })
      .catch((err) => {
        if (environment.debug) {
          console.error(err);
        }
        return Observable.of({ type: IMPORTING_BUS_FAILED });
      })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({dispatch: false}) importingBusMinimalConfig$ = this.actions$
    .ofType(IMPORTING_BUS_MINIMAL_CONFIG)
    .map((action: Action) => {
      this.workspaces$.subscribe((workspaces: WorkspacesStateRecord) => {
        let selectedWorkspaceId = workspaces.get('selectedWorkspaceId');

        this.router.navigate([
          '/cockpit',
          'workspaces',
          selectedWorkspaceId,
          'petals',
          'bus',
          action.payload.id
        ]);
      });
    });

  @Effect({dispatch: true}) fetchingBusConfig$: Observable<Action> = this.actions$
    .ofType(FETCHING_BUS_CONFIG)
    .switchMap(action => this.workspaceService.getBusConfig()
      .map((res: Response) => {
        if (!res.ok) {
          throw new Error('Error while getting the bus');
        }

        let config: any = res.json();

        return { type: FETCHING_BUS_CONFIG_SUCCESS, payload: { idBus: action.payload, config } };
      })
      .catch((err) => {
        if (environment.debug) {
          console.error(err);
        }
        return Observable.of({ type: FETCHING_BUS_CONFIG_FAILED });
      })
    );
}
