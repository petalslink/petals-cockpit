/**
 * Copyright (C) 2017-2018 Linagora
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
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

// TODO Fix Lint error: all imports on this line are unused.
// tslint:disable: no-unused-variable
import { LocalStorageService } from 'ngx-webstorage';
import { Observable, Subject } from 'rxjs';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { IBusInProgress } from 'app/features/cockpit/workspaces/state/buses-in-progress/buses-in-progress.interface';
import { getBusesInProgress } from 'app/features/cockpit/workspaces/state/buses-in-progress/buses-in-progress.selectors';
import { IEndpointRow } from 'app/features/cockpit/workspaces/state/endpoints/endpoints.interface';
import { getAllEndpoints } from 'app/features/cockpit/workspaces/state/endpoints/endpoints.selectors';
import { IInterfaceRow } from 'app/features/cockpit/workspaces/state/interfaces/interfaces.interface';
import { getAllInterfaces } from 'app/features/cockpit/workspaces/state/interfaces/interfaces.selectors';
import { IServiceRow } from 'app/features/cockpit/workspaces/state/services/services.interface';
import { getAllServices } from 'app/features/cockpit/workspaces/state/services/services.selectors';
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
  interfaces$: Observable<IInterfaceRow[]>;
  endpoints$: Observable<IEndpointRow[]>;
  services$: Observable<IServiceRow[]>;
  tree$: Observable<WorkspaceElement[]>;

  retrievedSelectedIndex: number;

  constructor(
    private store$: Store<IStore>,
    private router: Router,
    private dialog: MatDialog,
    private storage: LocalStorageService
  ) {}

  ngOnInit() {
    // TODO: investigate observable unsubscription
    // See https://gitlab.com/linagora/petals-cockpit/issues/445

    this.workspace$ = this.store$.select(getCurrentWorkspace);
    this.busesInProgress$ = this.store$.select(getBusesInProgress);

    this.interfaces$ = this.store$
      .select(getAllInterfaces)
      .pipe(takeUntil(this.onDestroy$));

    this.services$ = this.store$
      .select(getAllServices)
      .pipe(takeUntil(this.onDestroy$));

    this.endpoints$ = this.store$
      .select(getAllEndpoints)
      .pipe(takeUntil(this.onDestroy$));

    this.tree$ = this.store$.select(getCurrentWorkspaceTree);

    this.retrievedSelectedIndex = this.storage.retrieve(
      'left-menu-selected-index'
    );

    // sidenav
    this.sidenavVisible$ = this.store$.select(
      state => state.ui.isSidenavVisible
    );
    this.sidenavMode$ = this.store$.pipe(
      isSmallScreen,
      map(ss => (ss ? `over` : `side`))
    );

    // open deleted warning if the workspace has been deleted
    this.store$
      .select(state => state.workspaces.isSelectedWorkspaceDeleted)
      .pipe(
        filter(d => d),
        takeUntil(this.onDestroy$),
        switchMap(() =>
          this.dialog.open(DeletedWorkspaceDialogComponent).afterClosed()
        ),
        tap(() => this.router.navigate(['/workspaces']))
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

  saveCurrentTab(tabIndex: number) {
    this.storage.store('left-menu-selected-index', tabIndex);
  }
}

@Component({
  selector: 'app-workspace-deleted-dialog',
  template: `
    <div fxLayout="column" class="content content-max-width">
      <div class="central-content">
        <div fxLayout="row" matDialogTitle fxLayoutAlign="start start">
          <span fxLayoutAlign="start center">
            <mat-icon color="primary">check_circle</mat-icon>
            <span class="margin-left-x1">Workspace deleted!</span>
          </span>
        </div>
        <mat-dialog-content>
          <div fxLayout="column" fxFill>
              <p class="mat-body-1">This workspace was deleted, <b>click on OK</b> to go back to the workspaces list.</p>
          </div>
        </mat-dialog-content>
        <mat-dialog-actions class="margin-top-x1" fxLayout="row" fxLayoutAlign="end center">
          <button mat-raised-button matDialogClose color="primary">OK</button>
        </mat-dialog-actions>
      </div>
    </div>
  `,
  styles: ['.central-content { padding: 24px; }'],
})
export class DeletedWorkspaceDialogComponent {}
