/**
 * Copyright (C) 2017-2020 Linagora
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
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';

import { Observable, Subject } from 'rxjs';
import {
  filter,
  startWith,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { Workspaces } from '@feat/cockpit/workspaces/state/workspaces/workspaces.actions';
import { IStore } from '@shared/state/store.interface';
import { IUi } from '@shared/state/ui.interface';
import { isLargeScreen } from '@shared/state/ui.selectors';
import {
  IWorkspaceRow,
  IWorkspaces,
} from '@wks/state/workspaces/workspaces.interface';
import {
  getCurrentBreadcrumbs,
  getCurrentUserWorkspaces,
  getCurrentWorkspace,
  IBreadcrumb,
} from '@wks/state/workspaces/workspaces.selectors';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss'],
})
export class WorkspaceComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  ui$: Observable<IUi>;
  workspacesList$: Observable<IWorkspaces>;
  workspace$: Observable<IWorkspaceRow>;
  isFetchingWorkspace$: Observable<boolean>;
  isLargeScreen$: Observable<boolean>;

  breadcrumbList$: Observable<IBreadcrumb[]>;

  constructor(
    private store$: Store<IStore>,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.workspacesList$ = this.store$.pipe(
      getCurrentUserWorkspaces,
      filter(wksList => wksList !== undefined)
    );

    this.isLargeScreen$ = this.store$.pipe(isLargeScreen);

    this.ui$ = this.store$.pipe(select(state => state.ui));

    this.workspace$ = this.store$.pipe(select(getCurrentWorkspace));

    // open deleted warning if the workspace has been deleted
    this.store$
      .pipe(
        select(state => state.workspaces.isSelectedWorkspaceDeleted),
        filter(d => d),
        takeUntil(this.onDestroy$),
        switchMap(() =>
          this.dialog
            .open(DeletedWorkspaceDialogComponent)
            .beforeClose()
            .pipe(
              tap(_ => {
                this.router.navigate(['/workspaces'], {
                  queryParams: { page: 'list' },
                });
              })
            )
        )
      )
      .subscribe();

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.onDestroy$),
        startWith({
          url: this.router.url,
        }),
        tap((evt: NavigationEnd) => {
          this.breadcrumbList$ = this.store$.pipe(
            select(getCurrentBreadcrumbs, evt.url),
            take(1)
          );
        })
      )
      .subscribe();

    this.isFetchingWorkspace$ = this.store$.pipe(
      select(state => state.workspaces.isFetchingWorkspace)
    );
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();

    // the workspaces action clean is used to reinitialize a partial store when we are no longer in a workspace
    this.store$.dispatch(new Workspaces.CleanWorkspace());
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
          <div fxLayout="column" fxFlexFill>
            <p>
              This workspace was deleted, <b>click on OK</b> to go back to the
              workspaces list.
            </p>
          </div>
        </mat-dialog-content>
        <mat-dialog-actions
          class="margin-top-x1"
          fxLayout="row"
          fxLayoutAlign="end center"
        >
          <button
            mat-raised-button
            matDialogClose
            (click)="close()"
            color="primary"
            class="text-upper"
          >
            Ok
          </button>
        </mat-dialog-actions>
      </div>
    </div>
  `,
  styles: ['.central-content { padding: 24px; }'],
})
export class DeletedWorkspaceDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeletedWorkspaceDialogComponent>
  ) {}

  close() {
    this.dialogRef.close();
  }
}
