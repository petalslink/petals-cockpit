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

import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MD_DIALOG_DATA, MdDialog, MdDialogRef } from '@angular/material';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { Workspaces } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.actions';
import { IStore } from 'app/shared/state/store.interface';
import { Ui } from 'app/shared/state/ui.actions';
import { Users } from 'app/shared/state/users.actions';
import { IUserRow } from 'app/shared/state/users.interface';
import { getCurrentUser } from 'app/shared/state/users.selectors';
import { SharedValidator } from 'app/shared/validators/shared.validator';
import { IWorkspaceRow } from '../state/workspaces/workspaces.interface';
import {
  getCurrentWorkspace,
  getCurrentWorkspaceUsers,
  getUsersNotInCurrentWorkspace,
} from '../state/workspaces/workspaces.selectors';

@Component({
  selector: 'app-workspace-overview',
  templateUrl: './workspace-overview.component.html',
  styleUrls: ['./workspace-overview.component.scss'],
})
export class WorkspaceOverviewComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  workspace$: Observable<IWorkspaceRow>;
  users$: Observable<IUserRow[]>;
  currentUserId$: Observable<string>;
  appUsers$: Observable<string[]>;

  isRemoving = false;

  isEditingDescription = false;
  isSettingDescription = false;
  description: string = null;

  addUserFormGroup: FormGroup;
  filteredUsers$: Observable<string[]>;

  constructor(
    private fb: FormBuilder,
    private store$: Store<IStore>,
    private dialog: MdDialog,
    private actions$: Actions
  ) {}

  ngOnInit() {
    this.store$.dispatch(
      new Ui.SetTitles({
        titleMainPart1: 'Workspace',
        titleMainPart2: 'Petals',
      })
    );

    this.store$.dispatch(new Users.FetchAll());

    this.appUsers$ = this.store$
      .select(getUsersNotInCurrentWorkspace)
      .map(us => us.map(u => u.id).sort());

    this.addUserFormGroup = this.fb.group({
      userSearchCtrl: [
        '',
        Validators.required,
        [SharedValidator.isStringInObsArrayValidator(this.appUsers$)],
      ],
    });

    this.currentUserId$ = this.store$.let(getCurrentUser).map(user => user.id);

    this.workspace$ = this.store$
      .select(getCurrentWorkspace)
      .do(
        wk =>
          wk.isAddingUserToWorkspace
            ? this.addUserFormGroup.get('userSearchCtrl').disable()
            : this.addUserFormGroup.get('userSearchCtrl').enable()
      );

    this.users$ = this.store$.let(getCurrentWorkspaceUsers);

    this.store$
      // when we change workspace
      .select(state => state.workspaces.selectedWorkspaceId)
      .takeUntil(this.onDestroy$)
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

    this.filteredUsers$ = this.addUserFormGroup
      .get('userSearchCtrl')
      .valueChanges.startWith(null)
      .combineLatest(this.appUsers$)
      .map(([userSearch, users]) => this.filterUsers(userSearch, users));

    // when a user is added to the workspace
    this.actions$
      .ofType(Workspaces.AddUserSuccessType)
      .takeUntil(this.onDestroy$)
      // reset the form
      .do(_ => this.addUserFormGroup.reset())
      .subscribe();
  }

  filterUsers(search: string, users: string[]) {
    return !!search ? users.filter(user => user.includes(search)) : users;
  }

  addUser() {
    const id = this.addUserFormGroup.get('userSearchCtrl').value;
    this.store$.dispatch(new Workspaces.AddUser({ id }));
  }

  removeUser(id: string) {
    this.store$.dispatch(new Workspaces.DeleteUser({ id }));
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

  trackByUser(i: number, user: IUserRow) {
    return user.id;
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
