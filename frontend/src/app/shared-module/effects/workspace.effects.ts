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
  FETCH_WORKSPACES,
  FETCH_WORKSPACES_FAILED,
  FETCH_WORKSPACES_SUCCESS,
  IMPORT_BUS,
  IMPORT_BUS_FAILED,
  FETCH_BUS_CONFIG_SUCCESS,
  FETCH_BUS_CONFIG,
  FETCH_BUS_CONFIG_FAILED,
  IMPORT_BUS_MINIMAL_CONFIG,
  CHANGE_WORKSPACE,
  FETCH_WORKSPACE, FETCH_WORKSPACE_FAILED, FETCH_WORKSPACE_SUCCESS
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
  @Effect({dispatch: true}) changeWorkspace$: Observable<Action> = this.actions$
    .ofType(CHANGE_WORKSPACE)
    // TODO: Debug why the action triggered at the end of this effect (FETCH_WORKSPACE)
    // is run before the action CHANGE_WORKSPACE if we remove the delay
    .switchMap((actionTmp: Action) => Observable.of(actionTmp).delay(500)
      .map((action: any) => {
        // TODO: Restore SSE subscription once the refactor needed on workspaces state is done
        // this.sseService.subscribeToMessage(action.payload)
        // .map(msg => {
        //   if (msg.event === 'BUS_IMPORT_OK') {
        //     return { type: ADD_BUS, payload: msg.data };
        //   }
        //   else if (msg.event === 'BUS_IMPORT_ERROR') {
        //     // TODO
        //     return { type: '', payload: null };
        //   }
        //   else {
        //     return { type: '', payload: null };
        //   }
        // })

        return { type: FETCH_WORKSPACE, payload: action.payload };
      })
    );

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

        return Observable.of({type: FETCH_WORKSPACE_FAILED});
      })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({dispatch: true}) fetchWorkspaces$: Observable<Action> = this.actions$
    .ofType(FETCH_WORKSPACES)
    .switchMap(action => this.workspaceService.updateWorkspaces()
      .map((res: Response) => {
        if (!res.ok) {
          throw new Error('Error while fetching workspaces');
        }

        let workspaces: Array<IWorkspace> = res.json();

        return { type: FETCH_WORKSPACES_SUCCESS, payload: workspaces };
      })
      .catch((err) => {
        if (environment.debug) {
          console.error(err);
        }

        return Observable.of({ type: FETCH_WORKSPACES_FAILED });
      })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({dispatch: true}) importBus$: Observable<Action> = this.actions$
    .ofType(IMPORT_BUS)
    .switchMap(action => this.workspaceService.importBus(action.payload)
      .map((res: Response) => {
        if (!res.ok) {
          throw new Error('Error while importing the bus');
        }

        // at this point, the server has only returned an ID + the previous information
        // sent to create the bus. Save it so we can display the bus into importing list
        return { type: 'IMPORT_BUS_MINIMAL_CONFIG', payload: res.json() };

      })
      .catch((err) => {
        if (environment.debug) {
          console.error(err);
        }
        return Observable.of({ type: IMPORT_BUS_FAILED });
      })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({dispatch: false}) importBusMinimalConfig$ = this.actions$
    .ofType(IMPORT_BUS_MINIMAL_CONFIG)
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
