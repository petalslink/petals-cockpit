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
import { ConfigActions } from '../../../../../../shared-module/reducers/config.actions';

@Component({
  selector: 'app-petals-sidenav-menu',
  templateUrl: 'petals-sidenav-menu.component.html',
  styleUrls: ['petals-sidenav-menu.component.scss']
})
export class PetalsSidenavMenuComponent implements OnDestroy {
  // the workspace here will be retrieved from a selector (computed view)
  // it's the one we'll be mainly using in the view
  public workspace: IWorkspace;
  private workspaceSub: Subscription;

  // but, in order not to lock the search bar when a search doesn't have any bus
  // when need to be aware of the real workspace (not the computed one)
  public workspaceNotComputed: IWorkspace;
  private workspaceNotComputedSub: Subscription;

  constructor(private store$: Store<IStore>) {
    this.workspaceNotComputedSub =
      store$.select('workspace')
        .map((workspaceNotComputedR: IWorkspaceRecord) => workspaceNotComputedR.toJS())
        .subscribe((workspaceNotComputed: IWorkspace) => this.workspaceNotComputed = workspaceNotComputed);

    this.workspaceSub =
      store$.let(getSearchedWorkspace())
        .map((workspaceR: IWorkspaceRecord) => workspaceR.toJS())
        .subscribe((workspace: IWorkspace) => this.workspace = workspace);
  }

  ngOnDestroy() {
    this.workspaceSub.unsubscribe();
    this.workspaceNotComputedSub.unsubscribe();
  }

  search(textSearch) {
    this.store$.dispatch({ type: WorkspaceActions.EDIT_PETALS_SEARCH, payload: textSearch });
  }

  closeSidenavMobile() {
    this.store$.dispatch({ type: ConfigActions.CLOSE_SIDENAV_IF_MOBILE });
  }
}
