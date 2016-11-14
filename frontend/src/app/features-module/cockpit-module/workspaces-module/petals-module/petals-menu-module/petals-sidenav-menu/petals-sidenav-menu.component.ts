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
import { Component, OnDestroy } from '@angular/core';

// rxjs
import { Subscription } from 'rxjs';

// ngrx
import { Store } from '@ngrx/store';

// our interfaces
import { IStore } from '../../../../../../shared-module/interfaces/store.interface';
import { IWorkspaceRecord, IWorkspace } from '../../../../../../shared-module/interfaces/workspace.interface';

// our selectors
import { getSearchedWorkspace } from '../../../../../../shared-module/reducers/workspace.reducer';

// our actions
import { WorkspaceActions } from '../../../../../../shared-module/reducers/workspace.actions';

@Component({
  selector: 'app-petals-sidenav-menu',
  templateUrl: 'petals-sidenav-menu.component.html',
  styleUrls: ['petals-sidenav-menu.component.scss']
})
export class PetalsSidenavMenuComponent implements OnDestroy {
  private workspace: IWorkspace;
  private workspaceSub: Subscription;

  constructor(private store$: Store<IStore>) {
    this.workspaceSub =
      store$.let(getSearchedWorkspace())
        .map((workspaceR: IWorkspaceRecord) => workspaceR.toJS())
        .subscribe((workspace: IWorkspace) => this.workspace = workspace);
  }

  ngOnDestroy() {
    this.workspaceSub.unsubscribe();
  }

  search(textSearch) {
    this.store$.dispatch({ type: WorkspaceActions.EDIT_PETALS_SEARCH, payload: textSearch });
  }
}
