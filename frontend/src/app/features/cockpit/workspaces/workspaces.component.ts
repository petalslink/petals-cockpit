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

import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { IStore } from 'app/shared/state/store.interface';
import { Observable, Subject } from 'rxjs';
import { finalize, first, takeUntil, tap } from 'rxjs/operators';

import { Ui } from 'app/shared/state/ui.actions';
import { ICurrentUser } from 'app/shared/state/users.interface';
import { getCurrentUser } from 'app/shared/state/users.selectors';
import { Workspaces } from './state/workspaces/workspaces.actions';
import {
  IWorkspace,
  IWorkspaces,
} from './state/workspaces/workspaces.interface';
import { getWorkspaces } from './state/workspaces/workspaces.selectors';

@Component({
  selector: 'app-workspaces',
  templateUrl: './workspaces.component.html',
  styleUrls: ['./workspaces.component.scss'],
})
export class WorkspacesComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  private workspacesDialog: MatDialogRef<any>;
  @ViewChild('workspaceList') template: TemplateRef<any>;

  workspaces$: Observable<IWorkspaces>;
  user$: Observable<ICurrentUser>;

  constructor(
    private store$: Store<IStore>,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.workspaces$ = this.store$.pipe(getWorkspaces);
    this.user$ = this.store$.pipe(getCurrentUser);

    // open workspace dialog when needed
    this.store$
      .select(state => state.ui.isPopupListWorkspacesVisible)
      .pipe(
        takeUntil(this.onDestroy$),
        tap(isPopupListWorkspacesVisible => {
          if (isPopupListWorkspacesVisible) {
            this.openWorkspacesDialog();
          } else if (this.workspacesDialog) {
            this.workspacesDialog.close();
          }
        }),
        finalize(() => {
          if (this.workspacesDialog) {
            this.workspacesDialog.close();
          }
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  fetchWorkspace(ws: IWorkspace) {
    this.workspacesDialog.close(ws);
  }

  createWorkspace(name: string) {
    this.store$.dispatch(new Workspaces.Create({ name }));
  }

  private openWorkspacesDialog() {
    this.store$.dispatch(new Workspaces.FetchAll());

    this.store$
      .select(state => !state.workspaces.selectedWorkspaceId)
      .pipe(
        first(),
        tap(noWorkspace =>
          // until https://github.com/angular/angular/issues/15634 is fixed
          setTimeout(() => {
            this.workspacesDialog = this.dialog.open(this.template, {
              disableClose: noWorkspace,
            });

            this.workspacesDialog
              .afterClosed()
              .pipe(
                tap((selected: IWorkspace) =>
                  this.onWorkspacesDialogClose(selected)
                )
              )
              .subscribe();
          })
        )
      )
      .subscribe();
  }

  private onWorkspacesDialogClose(selected: IWorkspace) {
    this.workspacesDialog = null;
    if (selected) {
      this.store$
        .select(state => state.workspaces.selectedWorkspaceId)
        .pipe(
          first(),
          tap(wsId => {
            if (wsId !== selected.id) {
              this.router.navigate(['/workspaces', selected.id]);
            }
          })
        )
        .subscribe();
    }
    // ensure the store is in a valid state
    this.store$.dispatch(new Ui.CloseWorkspaces());
  }
}

@Component({
  selector: 'app-no-workspace',
  template: '',
})
export class NoWorkspaceComponent implements OnInit, OnDestroy {
  constructor(private store$: Store<IStore>) {}

  ngOnInit() {
    this.store$.dispatch(
      new Ui.SetTitles({
        titleMainPart1: 'Petals Cockpit',
        titleMainPart2: 'Workspaces List',
      })
    );
    this.store$.dispatch(new Ui.OpenWorkspaces());
  }

  ngOnDestroy() {
    this.store$.dispatch(new Ui.CloseWorkspaces());
  }
}
