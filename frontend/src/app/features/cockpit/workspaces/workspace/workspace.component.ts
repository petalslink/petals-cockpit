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

import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MdDialog, MdDialogRef, MD_DIALOG_DATA } from '@angular/material';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { IStore } from '../../../../shared/state/store.interface';
import { IWorkspaceRow } from './../state/workspaces/workspaces.interface';
import {
  getCurrentWorkspace,
  filterWorkspaceFetched,
  getCurrentWorkspaceUsers,
} from '../../../cockpit/workspaces/state/workspaces/workspaces.selectors';

import { Ui } from 'app/shared/state/ui.actions';
import { Workspaces } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.actions';
import { IUserRow } from 'app/shared/state/users.interface';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss'],
})
export class WorkspaceComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  workspace$: Observable<IWorkspaceRow>;
  users$: Observable<IUserRow[]>;

  isRemoving = false;

  isEditingDescription = false;
  isSettingDescription = false;
  description: string = null;

  constructor(private store$: Store<IStore>, private dialog: MdDialog) {}

  ngOnInit() {
    this.store$.dispatch(
      new Ui.SetTitles({
        titleMainPart1: 'Workspace',
        titleMainPart2: 'Petals',
      })
    );

    this.workspace$ = this.store$.let(getCurrentWorkspace);
    this.users$ = this.store$.let(getCurrentWorkspaceUsers);

    this.store$
      .let(filterWorkspaceFetched)
      .takeUntil(this.onDestroy$)
      // only when we change workspace!
      .map(state => state.workspaces.selectedWorkspaceId)
      .distinctUntilChanged()
      .do(id => {
        // we reinit these in case one change workspace while editing
        this.description = null;
        this.isEditingDescription = false;
        this.isSettingDescription = false;
        this.store$.dispatch(new Workspaces.FetchDetails({ id }));
      })
      .subscribe();

    this.workspace$
      .takeUntil(this.onDestroy$)
      // only when we are setting the description and it has finished
      .filter(ws => !ws.isSettingDescription && this.isSettingDescription)
      .do(ws => {
        // we reinit these, and it will show the current value of the description in the store
        this.description = null;
        this.isEditingDescription = false;
        this.isSettingDescription = false;
      })
      .subscribe();
  }

  editDescription() {
    this.isEditingDescription = true;
    // note: there could be a small moment where description is not set!
    this.workspace$
      .first()
      .do(ws => {
        this.description = ws.description;
      })
      .subscribe();
  }

  cancelDescription() {
    this.description = null;
    this.isEditingDescription = false;
    this.isSettingDescription = false;
  }

  validateDescription() {
    this.isSettingDescription = true;
    const description = this.description;
    this.workspace$
      .first()
      .do(ws => {
        this.store$.dispatch(
          new Workspaces.SetDescription({ id: ws.id, description })
        );
      })
      .subscribe();
  }

  openDeletionDialog() {
    this.isRemoving = true;
    this.workspace$
      .first()
      .switchMap(ws =>
        this.dialog
          .open(WorkspaceDeleteDialogComponent, {
            data: { name: ws.name },
          })
          .afterClosed()
          .map(res => !!res)
          .do(result => (this.isRemoving = result))
          .filter(result => result)
          .do(_ => this.store$.dispatch(new Workspaces.Delete({ id: ws.id })))
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}

@Component({
  selector: 'app-workspace-deletion-dialog',
  template: `
    <div fxLayout="column" class="content content-max-width">
      <div class="central-content">
        <div fxLayout="row" md-dialog-title fxLayoutAlign="start start">
          <span fxLayoutAlign="start center">
            <md-icon color="warn">warning</md-icon>
            <span class="margin-left-x1">Delete workspace?</span>
          </span>
        </div>
        <md-dialog-content>
          <p fxLayout="column">
            <span>Everything in the workspace will be deleted! <b>Please, be certain</b>.</span>
            <span class="margin-top-x1">Are you sure you want to delete <b>{{ data.name }}</b>?</span>
          </p>
        </md-dialog-content>

        <md-dialog-actions class="margin-top-x1" fxLayout="row" fxLayoutAlign="end center">
          <button md-button md-dialog-close class="btn-cancel-delete-wks margin-right-x1">Cancel</button>
          <button md-raised-button color="warn" class="btn-confirm-delete-wks" (click)="dialogRef.close(true)">Delete</button>
        </md-dialog-actions>
      </div>
    </div>
  `,
  styles: [
    'md-dialog-content { height: 100%; } .central-content { padding: 24px; }',
  ],
})
export class WorkspaceDeleteDialogComponent {
  constructor(
    public dialogRef: MdDialogRef<WorkspaceDeleteDialogComponent>,
    // TODO add some type for data when https://github.com/angular/angular/issues/15424 is fixed
    @Inject(MD_DIALOG_DATA) public data: any
  ) {}
}
