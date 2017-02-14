/**
 * Copyright (C) 2017 Linagora
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

import { Component, ViewChild, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';

import { Workspaces } from '../workspaces/state/workspaces/workspaces.reducer';
import { IStore } from '../../../shared/interfaces/store.interface';
import { getWorkspacesList } from '../workspaces/state/workspaces/workspaces.selectors';
import { IWorkspaces } from '../workspaces/state/workspaces/workspaces.interface';
import { IWorkspace } from '../workspaces/state/workspaces/workspace.interface';

@Component({
  selector: 'app-workspaces-dialog',
  templateUrl: './workspaces-dialog.component.html',
  styleUrls: ['./workspaces-dialog.component.scss']
})
export class WorkspacesDialogComponent implements OnInit {
  public workspaces$: Observable<IWorkspaces>;

  constructor(private _store$: Store<IStore>) { }

  ngOnInit() {
    this.workspaces$ = this._store$.let(getWorkspacesList());
  }

  // TODO use good type
  fetchWorkspace(workspace: IWorkspace) {
    this._store$.dispatch({
      type: Workspaces.FETCH_WORKSPACE, payload: {
        id: workspace.id,
        changeUrl: true
      }
    });
  }
}
