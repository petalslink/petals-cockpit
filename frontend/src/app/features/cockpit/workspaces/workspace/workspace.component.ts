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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { MdDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { IBusInProgress } from 'app/features/cockpit/workspaces/state/buses-in-progress/buses-in-progress.interface';
import { getBusesInProgress } from 'app/features/cockpit/workspaces/state/buses-in-progress/buses-in-progress.selectors';
import { Workspaces } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.actions';
import { IWorkspaceRow } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.interface';
import {
  getCurrentWorkspace,
  getCurrentWorkspaceTree,
  WorkspaceElement,
} from 'app/features/cockpit/workspaces/state/workspaces/workspaces.selectors';
import { IStore } from 'app/shared/state/store.interface';
import { Ui } from 'app/shared/state/ui.actions';
import { isSmallScreen } from 'app/shared/state/ui.selectors';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss'],
})
export class WorkspaceComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  sidenavVisible$: Observable<boolean>;
  sidenavMode$: Observable<string>;
  workspace$: Observable<IWorkspaceRow>;
  busesInProgress$: Observable<IBusInProgress[]>;
  tree$: Observable<WorkspaceElement[]>;

  showShadow = true;

  constructor(
    private store$: Store<IStore>,
    private router: Router,
    private dialog: MdDialog
  ) {}

  ngOnInit() {
    this.workspace$ = this.store$.let(getCurrentWorkspace);
    this.busesInProgress$ = this.store$.let(getBusesInProgress);
    this.tree$ = this.store$.let(getCurrentWorkspaceTree);

    // sidenav
    this.sidenavVisible$ = this.store$.select(
      state => state.ui.isSidenavVisible
    );
    this.sidenavMode$ = this.store$
      .let(isSmallScreen)
      .map(ss => (ss ? `over` : `side`));

    // open deleted warning if the workspace has been deleted
    this.store$
      .select(state => state.workspaces.isSelectedWorkspaceDeleted)
      .filter(d => d)
      .takeUntil(this.onDestroy$)
      .switchMap(() =>
        this.dialog
          .open(DeletedWorkspaceDialogComponent)
          .afterClosed()
          .do(() => this.router.navigate(['/workspaces']))
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();

    this.store$.dispatch(new Workspaces.Clean());
  }

  closeSidenav() {
    this.store$.dispatch(new Ui.CloseSidenav());
  }

  closeSidenavOnSmallScreen() {
    this.store$.dispatch(new Ui.CloseSidenavOnSmallScreen());
  }

  openWorkspacesDialog() {
    this.store$.dispatch(new Ui.OpenWorkspaces());
  }
}

@Component({
  selector: 'app-workspace-deleted-dialog',
  template: `
    <div fxLayout="column" class="content content-max-width">
      <div class="central-content">
        <div fxLayout="row" md-dialog-title fxLayoutAlign="start start">
          <span fxLayoutAlign="start center">
            <md-icon color="primary">check_circle</md-icon>
            <span class="margin-left-x1">Workspace deleted!</span>
          </span>
        </div>
        <md-dialog-content>
          <div fxLayout="column" fxFill>
              <p>This workspace was deleted, <b>click on OK</b> to go back to the workspaces list.</p>
          </div>
        </md-dialog-content>
        <md-dialog-actions class="margin-top-x1" fxLayout="row" fxLayoutAlign="end center">
          <button md-raised-button md-dialog-close color="primary">OK</button>
        </md-dialog-actions>
      </div>
    </div>
  `,
  styles: [
    'md-dialog-content { height: 100%; } .central-content { padding: 24px; }',
  ],
})
export class DeletedWorkspaceDialogComponent {}
