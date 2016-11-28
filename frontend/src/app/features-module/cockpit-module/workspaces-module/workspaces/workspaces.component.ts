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

// angular module
import { Component, OnDestroy, ViewChild } from '@angular/core';

// material
import { MdInput } from '@angular/material';

// rxjs
import { Subscription } from 'rxjs';

// ngrx - store
import { Store } from '@ngrx/store';

// our interfaces
import { IStore } from '../../../../shared-module/interfaces/store.interface';
import {
  IMinimalWorkspace,
  IMinimalWorkspaces,
  IMinimalWorkspacesRecord
} from '../../../../shared-module/interfaces/minimal-workspaces.interface';
import { IWorkspace, IWorkspaceRecord } from '../../../../shared-module/interfaces/workspace.interface';
import { IUserRecord } from './../../../../shared-module/interfaces/user.interface';

// our actions
import { WorkspaceActions } from '../../../../shared-module/reducers/workspace.actions';
import { MinimalWorkspacesActions } from '../../../../shared-module/reducers/minimal-workspaces.actions';

// import
@Component({
  selector: 'app-workspaces',
  templateUrl: 'workspaces.component.html',
  styleUrls: ['workspaces.component.scss']
})
export class WorkspacesComponent implements OnDestroy {
  private minimalWorkspaces: IMinimalWorkspaces;
  private minimalWorkspacesSub: Subscription;

  private workspace: IWorkspace;
  private workspaceSub: Subscription;

  private name: string;
  private addingWorkspace = false;

  @ViewChild('nameInput') nameInput: MdInput;

  constructor(
    private store$: Store<IStore>
  ) {
    this.minimalWorkspacesSub =
      store$.select('minimalWorkspaces')
      .map((minimalWorkspacesR: IMinimalWorkspacesRecord) => minimalWorkspacesR.toJS())
      .withLatestFrom(this.store$.select('user'))
      .subscribe(([minimalWorkspaces, userR]: [IMinimalWorkspaces, IUserRecord]) => {
        this.minimalWorkspaces = minimalWorkspaces;

        // if a user receive a workspace, he's part of it
        // as we don't want to display himself in the used by field,
        // we can safely remove it from there
        this.minimalWorkspaces
          .minimalWorkspaces
          .map((minimalWorkspace: IMinimalWorkspace) => {
            minimalWorkspace.usedBy = minimalWorkspace.usedBy.filter((username: string) => username !== userR.get('username'));
            return minimalWorkspace;
          });
      });

    this.workspaceSub =
      store$.select('workspace')
      .map((workspaceR: IWorkspaceRecord) => workspaceR.toJS())
      .subscribe((workspace: IWorkspace) => this.workspace = workspace);

    // TODO: find a way to let the workspace's name if error
    // when the addingWorkspace value from store is toggled, clean workspace's name
    store$.select('minimalWorkspaces')
      .map((minimalWorkspacesR: IMinimalWorkspacesRecord) => minimalWorkspacesR.get('addingWorkspace'))
      .distinctUntilChanged()
      .filter((addingWorkspace: boolean) => !addingWorkspace)
      .subscribe(() => {
        this.name = '';
        this.addingWorkspace = false;
      });
  }

  ngOnDestroy() {
    this.minimalWorkspacesSub.unsubscribe();
  }

  selectWorkspace(workspaceId: string) {
    this.store$.dispatch({ type: WorkspaceActions.FETCH_WORKSPACE, payload: workspaceId });
  }

  addWorkspace(name: string) {
    this.store$.dispatch({ type: MinimalWorkspacesActions.ADD_WORKSPACE, payload: name });
  }

  toggleAddPanel() {
    if (!this.addingWorkspace) {
      this.addingWorkspace = true;
      // need a 0 setTimeout because the input toggle from
      // hidden to visible and the focus is not working otherwise
      setTimeout(() => this.nameInput.focus(), 0);
      return;
    }

    this.addingWorkspace = false;
  }
}
