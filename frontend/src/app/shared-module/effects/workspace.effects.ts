// angular modules
import { Injectable, OnDestroy } from '@angular/core';
import { Response } from '@angular/http';

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

// our services
import { WorkspaceService } from '../services/workspace.service';

// our interfaces
import { IWorkspace } from '../interfaces/workspace.interface';

// our actions
import {
  FETCHING_WORKSPACES,
  FETCHING_WORKSPACES_FAILED,
  WORKSPACES_FETCHED
} from '../reducers/workspaces.reducer';

@Injectable()
export class WorkspaceEffects implements OnDestroy {
  // our subscription(s) to @ngrx/effects
  private subscription: Subscription;

  constructor(
    private actions$: Actions,
    private store$: Store<AppState>,
    private workspaceService: WorkspaceService
  ) {
    this.subscription = mergeEffects(this).subscribe(store$);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

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
}
