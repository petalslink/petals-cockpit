/**
 * Copyright (C) 2017-2019 Linagora
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
import { select, Store } from '@ngrx/store';

import { LocalStorageService } from 'ngx-webstorage';
import { Observable, Subject } from 'rxjs';
import { filter, switchMap, takeUntil } from 'rxjs/operators';

import { IStore } from '@shared/state/store.interface';
import { Ui } from '@shared/state/ui.actions';
import { IUi } from '@shared/state/ui.interface';
import { isLargeScreen } from '@shared/state/ui.selectors';
import { IBusInProgress } from '@wks/state/buses-in-progress/buses-in-progress.interface';
import { getBusesInProgress } from '@wks/state/buses-in-progress/buses-in-progress.selectors';
import { IEndpointRow } from '@wks/state/endpoints/endpoints.interface';
import { getAllEndpoints } from '@wks/state/endpoints/endpoints.selectors';
import { IInterfaceRow } from '@wks/state/interfaces/interfaces.interface';
import { getAllInterfaces } from '@wks/state/interfaces/interfaces.selectors';
import { IServiceRow } from '@wks/state/services/services.interface';
import { getAllServices } from '@wks/state/services/services.selectors';
import { Workspaces } from '@wks/state/workspaces/workspaces.actions';
import { IWorkspaceRow } from '@wks/state/workspaces/workspaces.interface';
import {
  getCurrentWorkspace,
  getCurrentWorkspaceTree,
  getWorkspacesIdsNames,
  IWorkspacesIdsNames,
  WorkspaceElement,
} from '@wks/state/workspaces/workspaces.selectors';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss'],
})
export class WorkspaceComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  ui$: Observable<IUi>;
  workspacesIdsNames$: Observable<{ list: IWorkspacesIdsNames[] }>;
  workspace$: Observable<IWorkspaceRow>;
  busesInProgress$: Observable<IBusInProgress[]>;
  interfaces$: Observable<IInterfaceRow[]>;
  endpoints$: Observable<IEndpointRow[]>;
  services$: Observable<IServiceRow[]>;
  tree$: Observable<WorkspaceElement[]>;

  sidenavMode$: Observable<string>;

  isFetchingWorkspace$: Observable<boolean>;
  isLargeScreen$: Observable<boolean>;
  isOnWorkspace$: Observable<boolean>;
  sidenavVisible$: Observable<boolean>;

  retrievedSelectedIndex: number;

  constructor(
    private store$: Store<IStore>,
    private router: Router,
    private dialog: MatDialog,
    private storage: LocalStorageService
  ) {}

  ngOnInit() {
    this.workspacesIdsNames$ = this.store$.pipe(getWorkspacesIdsNames);

    this.isLargeScreen$ = this.store$.pipe(isLargeScreen);

    this.isOnWorkspace$ = this.store$.pipe(
      select(state => !!state.workspaces.selectedWorkspaceId)
    );

    this.ui$ = this.store$.pipe(select(state => state.ui));

    this.workspace$ = this.store$.pipe(select(getCurrentWorkspace));

    this.busesInProgress$ = this.store$.pipe(select(getBusesInProgress));

    this.interfaces$ = this.store$.pipe(
      select(getAllInterfaces),
      takeUntil(this.onDestroy$)
    );

    this.services$ = this.store$.pipe(
      select(getAllServices),
      takeUntil(this.onDestroy$)
    );

    this.endpoints$ = this.store$.pipe(
      select(getAllEndpoints),
      takeUntil(this.onDestroy$)
    );

    this.tree$ = this.store$.pipe(select(getCurrentWorkspaceTree));

    this.retrievedSelectedIndex = this.storage.retrieve(
      'left-menu-selected-index'
    );

    // open deleted warning if the workspace has been deleted
    this.store$
      .pipe(
        select(state => state.workspaces.isSelectedWorkspaceDeleted),
        filter(d => d),
        takeUntil(this.onDestroy$),
        switchMap(() =>
          this.dialog.open(DeletedWorkspaceDialogComponent).afterClosed()
        )
      )
      .subscribe();

    this.isFetchingWorkspace$ = this.store$.pipe(
      select(state => state.workspaces.isFetchingWorkspace)
    );
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();

    this.store$.dispatch(new Workspaces.Clean());
  }

  goToWorkspacesList() {
    this.router.navigate(['/workspaces'], { queryParams: { page: 'list' } });
  }

  closeSidenav() {
    this.store$.dispatch(new Ui.CloseSidenav());
  }

  closeSidenavOnSmallScreen() {
    this.store$.dispatch(new Ui.CloseSidenavOnSmallScreen());
  }

  saveCurrentTab(tabIndex: number) {
    this.storage.store('left-menu-selected-index', tabIndex);
  }
}

@Component({
  selector: 'app-workspace-deleted-dialog',
  template: `
    <div fxLayout="column" class="content">
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
          <button mat-raised-button matDialogClose (click)="goToWorkspacesList()" color="primary">OK</button>
        </mat-dialog-actions>
      </div>
    </div>
  `,
  styles: ['.central-content { padding: 24px; }'],
})
export class DeletedWorkspaceDialogComponent {
  constructor(private router: Router) {}

  goToWorkspacesList() {
    this.router.navigate(['/workspaces'], { queryParams: { page: 'list' } });
  }
}
