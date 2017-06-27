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

import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { MdDialog, MdDialogRef } from '@angular/material';
import { MdSidenav } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Store } from '@ngrx/store';

import { IWorkspace } from './workspaces/state/workspaces/workspaces.interface';

import { IStore } from 'app/shared/state/store.interface';
import { IUi } from 'app/shared/state/ui.interface';
import { WorkspacesDialogComponent } from './workspaces-dialog/workspaces-dialog.component';
import { getCurrentWorkspace } from '../cockpit/workspaces/state/workspaces/workspaces.selectors';

import { isSmallScreen, isLargeScreen } from 'app/shared/state/ui.selectors';
import { Workspaces } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.actions';
import { Ui } from 'app/shared/state/ui.actions';
import { ICurrentUser } from 'app/shared/state/users.interface';
import { getCurrentUser } from 'app/shared/state/users.selectors';

@Component({
  selector: 'app-cockpit',
  templateUrl: './cockpit.component.html',
  styleUrls: ['./cockpit.component.scss'],
})
export class CockpitComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();
  private workspacesDialogRef: MdDialogRef<WorkspacesDialogComponent>;

  @ViewChild(MdSidenav) sidenav: MdSidenav;

  isLargeScreen$: Observable<boolean>;
  ui$: Observable<IUi>;
  user$: Observable<ICurrentUser>;
  isDisconnecting$: Observable<boolean>;
  sidenavVisible$: Observable<boolean>;
  sidenavMode$: Observable<string>;
  workspace$: Observable<IWorkspace>;

  constructor(private store$: Store<IStore>, private dialog: MdDialog) {}

  ngOnInit() {
    this.isLargeScreen$ = this.store$.let(isLargeScreen);
    this.user$ = this.store$.let(getCurrentUser());
    this.isDisconnecting$ = this.store$.select(
      state => state.users.isDisconnecting
    );

    this.workspace$ = this.store$.let(getCurrentWorkspace());
    this.ui$ = this.store$.select(state => state.ui);

    this.ui$
      .map(ui => ui.isPopupListWorkspacesVisible)
      .distinctUntilChanged()
      .takeUntil(this.onDestroy$)
      .do(isPopupListWorkspacesVisible => {
        if (isPopupListWorkspacesVisible) {
          this.doOpenWorkspacesDialog();
        } else if (this.workspacesDialogRef) {
          this.workspacesDialogRef.close();
          this.workspacesDialogRef = null;
        }
      })
      .subscribe();

    this.store$
      .select(state => state.workspaces.isSelectedWorkspaceDeleted)
      .filter(d => d)
      .takeUntil(this.onDestroy$)
      .do(_ => this.openDeletedWorkspaceDialog())
      .subscribe();

    // TODO ultimately, the sidebar should be moved to WorkspacesComponent
    this.sidenavVisible$ = this.store$.select(
      state =>
        state.ui.isSidenavVisible && !!state.workspaces.selectedWorkspaceId
    );

    this.sidenavMode$ = this.store$
      .let(isSmallScreen)
      .map(ss => (ss ? `over` : `side`));
  }

  ngOnDestroy() {
    // since the dialog is not really attached to the cockpit component in the DOM
    // it can stay even if the component is destroyed!
    if (this.workspacesDialogRef != null) {
      this.workspacesDialogRef.close();
      this.workspacesDialogRef = null;
    }

    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  private doOpenWorkspacesDialog() {
    this.store$.dispatch(new Workspaces.FetchAll());

    this.store$
      .select(state => !!state.workspaces.selectedWorkspaceId)
      .first()
      .do(ws => {
        this.workspacesDialogRef = this.dialog.open(WorkspacesDialogComponent, {
          disableClose: !ws,
        });

        this.workspacesDialogRef
          .afterClosed()
          .do(_ => {
            this.store$.dispatch(new Ui.CloseWorkspaces());
            this.workspacesDialogRef = null;
          })
          .subscribe();
      })
      .subscribe();
  }

  openDeletedWorkspaceDialog() {
    this.dialog
      .open(DeletedWorkspaceDialogComponent)
      .afterClosed()
      .do(_ => this.store$.dispatch(new Workspaces.Close({ delete: true })))
      .subscribe();
  }

  openWorkspacesDialog() {
    this.store$.dispatch(new Ui.OpenWorkspaces());
  }

  closeSidenav() {
    this.store$.dispatch(new Ui.CloseSidenav());
  }

  closeSidenavOnSmallScreen() {
    this.store$.dispatch(new Ui.CloseSidenavOnSmallScreen());
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
