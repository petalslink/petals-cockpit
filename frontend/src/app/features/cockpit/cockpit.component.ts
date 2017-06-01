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

import { Component, ViewChild, Inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MdDialog, MdDialogRef } from '@angular/material';
import { MdSidenav } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Store } from '@ngrx/store';

import { IWorkspace, IWorkspacesTable } from './workspaces/state/workspaces/workspaces.interface';
import { Workspaces } from './workspaces/state/workspaces/workspaces.reducer';
import { Ui } from '../../shared/state/ui.reducer';
import { LANGUAGES } from '../../core/opaque-tokens';
import { IStore } from '../../shared/interfaces/store.interface';
import { IUi } from '../../shared/interfaces/ui.interface';
import { WorkspacesDialogComponent } from './workspaces-dialog/workspaces-dialog.component';
import { getCurrentWorkspace } from '../cockpit/workspaces/state/workspaces/workspaces.selectors';
import { ICurrentUser } from 'app/shared/interfaces/users.interface';
import { getCurrentUser } from 'app/shared/state/users.selectors';
import { Users } from 'app/shared/state/users.reducer';
import { isSmallScreen, isLargeScreen } from 'app/shared/state/ui.selectors';

@Component({
  selector: 'app-cockpit',
  templateUrl: './cockpit.component.html',
  styleUrls: ['./cockpit.component.scss']
})
export class CockpitComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  private workspacesDialogRef: MdDialogRef<WorkspacesDialogComponent>;

  public ui$: Observable<IUi>;
  public sidenavVisible$: Observable<boolean>;
  public sidenavMode$: Observable<string>;
  public workspace$: Observable<IWorkspace>;
  public workspaces$: Observable<IWorkspacesTable>;
  public logoByScreenSize$: Observable<string>;
  public user$: Observable<ICurrentUser>;
  public isDisconnecting$: Observable<boolean>;

  @ViewChild(MdSidenav) sidenav: MdSidenav;

  constructor(
    private store$: Store<IStore>,
    @Inject(LANGUAGES) public languages: any,
    public dialog: MdDialog,
    private router: Router
  ) { }

  ngOnInit() {
    this.workspaces$ = this.store$.select(state => state.workspaces);

    this.workspace$ = this.store$.let(getCurrentWorkspace());

    this.ui$ = this.store$.select(state => state.ui);

    this.user$ = this.store$.let(getCurrentUser());

    this.isDisconnecting$ = this.store$.select(state => state.users.isDisconnecting);

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

    // TODO ultimately, the sidebar should be moved to WorkspaceComponent
    this.sidenavVisible$ = this.store$.select(state => state.ui.isSidenavVisible && !!state.workspaces.selectedWorkspaceId);

    this.logoByScreenSize$ = this.store$
      .let(isLargeScreen)
      .map(ls => {
        const imgSrcBase = `./assets/img`;
        const imgSrcExt = `png`;

        if (ls) {
          return `${imgSrcBase}/logo-petals-cockpit.${imgSrcExt}`;
        } else {
          return `${imgSrcBase}/logo-petals-cockpit-without-text.${imgSrcExt}`;
        }
      });

    this.sidenavMode$ = this.store$
      .let(isSmallScreen)
      .map(ss => ss ? `over` : `side`);
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
    this.store$.dispatch({ type: Workspaces.FETCH_WORKSPACES });

    this.store$
      .select(state => !!state.workspaces.selectedWorkspaceId)
      .first()
      .do(ws => {
        this.workspacesDialogRef = this.dialog.open(WorkspacesDialogComponent, {
          disableClose: !ws
        });

        this.workspacesDialogRef
          .afterClosed()
          .do(_ => {
            this.store$.dispatch({ type: Ui.CLOSE_POPUP_WORKSPACES_LIST });
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
      .do(_ => this.store$.dispatch({ type: Workspaces.CLOSE_WORKSPACE, payload: { delete: true } }))
      .subscribe();
  }

  openWorkspacesDialog() {
    this.store$.dispatch({ type: Ui.OPEN_POPUP_WORKSPACES_LIST });
  }

  openSidenav() {
    this.store$.dispatch({ type: Ui.OPEN_SIDENAV });
  }

  closeSidenav() {
    this.store$.dispatch({ type: Ui.CLOSE_SIDENAV });
  }

  closeSidenavOnSmallScreen() {
    this.store$.dispatch({ type: Ui.CLOSE_SIDENAV_ON_SMALL_SCREEN });
  }

  toggleSidenav() {
    this.store$.dispatch({ type: Ui.TOGGLE_SIDENAV });
  }

  disconnect() {
    this.store$.dispatch({ type: Users.DISCONNECT_USER });
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
  styles: ['md-dialog-content { height: 100%; } .central-content { padding: 24px; }']
})
export class DeletedWorkspaceDialogComponent { }
