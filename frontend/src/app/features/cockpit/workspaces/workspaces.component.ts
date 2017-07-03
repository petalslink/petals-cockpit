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

import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { MdDialog, MdDialogRef } from '@angular/material';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { IStore } from 'app/shared/state/store.interface';
import { Ui } from 'app/shared/state/ui.actions';
import { Workspaces } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.actions';
import { isSmallScreen } from 'app/shared/state/ui.selectors';
import {
  getWorkspaces,
  WorkspaceElement,
  getCurrentWorkspaceTree,
  getCurrentWorkspace,
} from 'app/features/cockpit/workspaces/state/workspaces/workspaces.selectors';
import {
  IWorkspace,
  IWorkspaces,
  IWorkspaceRow,
} from 'app/features/cockpit/workspaces/state/workspaces/workspaces.interface';
import { ICurrentUser } from 'app/shared/state/users.interface';
import { getCurrentUser } from 'app/shared/state/users.selectors';
import { getBusesInProgress } from 'app/features/cockpit/workspaces/state/buses-in-progress/buses-in-progress.selectors';
import { IBusInProgress } from 'app/features/cockpit/workspaces/state/buses-in-progress/buses-in-progress.interface';

@Component({
  selector: 'app-workspaces',
  templateUrl: './workspaces.component.html',
  styleUrls: ['./workspaces.component.scss'],
})
export class WorkspacesComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  private workspaceListDialog: MdDialogRef<any>;
  @ViewChild('workspaceList') template: TemplateRef<any>;

  sidenavVisible$: Observable<boolean>;
  sidenavMode$: Observable<string>;
  isOnWorkspace$: Observable<boolean>;
  workspace$: Observable<IWorkspaceRow>;
  workspaces$: Observable<IWorkspaces>;
  busesInProgress$: Observable<IBusInProgress[]>;
  tree$: Observable<WorkspaceElement[]>;
  user$: Observable<ICurrentUser>;

  showShadow = true;

  constructor(
    private store$: Store<IStore>,
    private router: Router,
    private dialog: MdDialog
  ) {}

  ngOnInit() {
    this.store$.dispatch(
      new Ui.SetTitles({
        titleMainPart1: 'Petals Cockpit',
        titleMainPart2: 'Workspaces List',
      })
    );

    this.workspace$ = this.store$.let(getCurrentWorkspace);
    this.workspaces$ = this.store$.let(getWorkspaces);
    this.user$ = this.store$.let(getCurrentUser());
    this.busesInProgress$ = this.store$
      .let(getBusesInProgress())
      .map(bips => bips.list);
    this.tree$ = this.store$.let(getCurrentWorkspaceTree);

    this.isOnWorkspace$ = this.store$.select(
      state => !!state.workspaces.selectedWorkspaceId
    );

    // sidenav
    this.sidenavVisible$ = this.store$.select(
      state =>
        state.ui.isSidenavVisible && !!state.workspaces.selectedWorkspaceId
    );
    this.sidenavMode$ = this.store$
      .let(isSmallScreen)
      .map(ss => (ss ? `over` : `side`));

    // open deleted warning if the workspace has been deleted
    this.store$
      .select(state => state.workspaces.isSelectedWorkspaceDeleted)
      .filter(d => d)
      .takeUntil(this.onDestroy$)
      .do(_ => this.doOpenDeletedWorkspaceDialog())
      .subscribe();

    // open workspace dialog when needed
    this.store$
      .select(state => state.ui)
      .map(ui => ui.isPopupListWorkspacesVisible)
      .distinctUntilChanged()
      .takeUntil(this.onDestroy$)
      .do(isPopupListWorkspacesVisible => {
        if (isPopupListWorkspacesVisible) {
          this.doOpenWorkspacesDialog();
        } else if (this.workspaceListDialog) {
          this.workspaceListDialog.close();
          this.workspaceListDialog = null;
        }
      })
      .subscribe();

    // open workspaces dialog if no workspace is selected
    this.store$
      .select(
        state =>
          !state.workspaces.selectedWorkspaceId && state.users.connectedUser
      )
      .takeUntil(this.onDestroy$)
      .do(notOnWsButConnected => {
        if (notOnWsButConnected) {
          this.store$.dispatch(new Ui.OpenWorkspaces());
        }
      })
      .subscribe();
  }

  ngOnDestroy() {
    // this must be done before onDestroy$
    this.store$.dispatch(new Ui.CloseWorkspaces());

    this.onDestroy$.next();
    this.onDestroy$.complete();

    this.store$.dispatch(new Workspaces.Close());
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

  fetch(ws: IWorkspace) {
    this.workspaceListDialog.close(ws);
  }

  private doOpenDeletedWorkspaceDialog() {
    this.dialog
      .open(DeletedWorkspaceDialogComponent)
      .afterClosed()
      .do(_ =>
        this.store$.dispatch(
          new Workspaces.Close({ goToWorkspaces: true, deleted: true })
        )
      )
      .subscribe();
  }

  private doOpenWorkspacesDialog() {
    this.store$.dispatch(new Workspaces.FetchAll());

    this.store$
      .select(state => !!state.workspaces.selectedWorkspaceId)
      .first()
      .do(ws => {
        this.workspaceListDialog = this.dialog.open(this.template, {
          disableClose: !ws,
        });

        this.workspaceListDialog
          .afterClosed()
          .do((selected: IWorkspace) => this.onWorkspacesDialogClose(selected))
          .subscribe();
      })
      .subscribe();
  }

  private onWorkspacesDialogClose(selected: IWorkspace) {
    if (selected) {
      this.store$
        .select(state => state.workspaces.selectedWorkspaceId)
        .first()
        .do(wsId => {
          // if no workspace is open, it will simply navigate to the required one
          if (wsId === selected.id) {
            this.store$.dispatch(new Ui.CloseWorkspaces());
          } else {
            this.router.navigate(['/workspaces', selected.id]);
          }
        })
        .subscribe();
    }
    this.store$.dispatch(new Ui.CloseWorkspaces());
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
