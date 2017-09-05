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
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { MdDialog, MdDialogRef } from '@angular/material';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { Workspaces } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.actions';
import {
  IWorkspace,
  IWorkspaces,
} from 'app/features/cockpit/workspaces/state/workspaces/workspaces.interface';
import { getWorkspaces } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.selectors';
import { IStore } from 'app/shared/state/store.interface';
import { Ui } from 'app/shared/state/ui.actions';
import { ICurrentUser } from 'app/shared/state/users.interface';
import { getCurrentUser } from 'app/shared/state/users.selectors';

@Component({
  selector: 'app-workspaces',
  templateUrl: './workspaces.component.html',
  styleUrls: ['./workspaces.component.scss'],
})
export class WorkspacesComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  private workspacesDialog: MdDialogRef<any>;
  @ViewChild('workspaceList') template: TemplateRef<any>;

  workspaces$: Observable<IWorkspaces>;
  user$: Observable<ICurrentUser>;

  constructor(
    private store$: Store<IStore>,
    private router: Router,
    private dialog: MdDialog
  ) {}

  ngOnInit() {
    this.workspaces$ = this.store$.let(getWorkspaces);
    this.user$ = this.store$.let(getCurrentUser);

    // open workspace dialog when needed
    this.store$
      .select(state => state.ui.isPopupListWorkspacesVisible)
      .takeUntil(this.onDestroy$)
      .do(isPopupListWorkspacesVisible => {
        if (isPopupListWorkspacesVisible) {
          this.openWorkspacesDialog();
        } else if (this.workspacesDialog) {
          this.workspacesDialog.close();
        }
      })
      .finally(() => {
        if (this.workspacesDialog) {
          this.workspacesDialog.close();
        }
      })
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
      .first()
      .do(noWorkspace =>
        // until https://github.com/angular/angular/issues/15634 is fixed
        setTimeout(() => {
          this.workspacesDialog = this.dialog.open(this.template, {
            disableClose: noWorkspace,
          });

          this.workspacesDialog
            .afterClosed()
            .do((selected: IWorkspace) =>
              this.onWorkspacesDialogClose(selected)
            )
            .subscribe();
        })
      )
      .subscribe();
  }

  private onWorkspacesDialogClose(selected: IWorkspace) {
    this.workspacesDialog = null;
    if (selected) {
      this.store$
        .select(state => state.workspaces.selectedWorkspaceId)
        .first()
        .do(wsId => {
          if (wsId !== selected.id) {
            this.router.navigate(['/workspaces', selected.id]);
          }
        })
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
