// angular modules
import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

// rxjs
import { Observable } from 'rxjs/Observable';

// store
import { Action } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';

// our environment
import { environment } from '../../../environments/environment';

// our services
import { WorkspaceService } from '../services/workspace.service';

// our actions
import {
  FETCH_WORKSPACES,
  FETCH_WORKSPACES_SUCCESS,
  FETCH_WORKSPACES_FAILED,
  ADD_WORKSPACE,
  ADD_WORKSPACE_SUCCESS,
  ADD_WORKSPACE_FAILED
} from '../reducers/minimal-workspaces.reducer';

import { IMinimalWorkspace } from '../interfaces/minimal-workspaces.interface';

@Injectable()
export class MinimalWorkspacesEffects {
  constructor(private actions$: Actions, private workspaceService: WorkspaceService) { }

  // tslint:disable-next-line:member-ordering
  @Effect({dispatch: true}) fetchWorkspaces$: Observable<Action> = this.actions$
    .ofType(FETCH_WORKSPACES)
    .switchMap(action => this.workspaceService.updateWorkspaces()
      .map((res: Response) => {
        if (!res.ok) {
          throw new Error('Error while fetching workspaces');
        }

        let minimalWorkspaces: Array<IMinimalWorkspace> = res.json();

        return { type: FETCH_WORKSPACES_SUCCESS, payload: minimalWorkspaces };
      })
      .catch((err) => {
        if (environment.debug) {
          console.error(err);
        }

        return Observable.of({ type: FETCH_WORKSPACES_FAILED });
      })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({dispatch: true}) addWorkspace$: Observable<Action> = this.actions$
    .ofType(ADD_WORKSPACE)
    .switchMap(action => this.workspaceService.addWorkspace(action.payload)
      .map((res: Response) => {
        if (!res.ok) {
          throw new Error(`Error while adding the workspace ${action.payload}`);
        }

        let minimalWorkspace: IMinimalWorkspace = res.json();

        return { type: ADD_WORKSPACE_SUCCESS, payload: minimalWorkspace };
      })
      .catch((err) => {
        if (environment.debug) {
          console.error(err);
        }

        return Observable.of({ type: ADD_WORKSPACE_FAILED });
      })
    );
}
