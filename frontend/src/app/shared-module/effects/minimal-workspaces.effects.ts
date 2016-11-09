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
