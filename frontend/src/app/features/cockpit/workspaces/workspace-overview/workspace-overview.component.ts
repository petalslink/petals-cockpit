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

import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { Actions, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { combineLatest } from 'rxjs';
import { filter, first, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { FormErrorStateMatcher } from '@shared/helpers/form.helper';
import { IStore } from '@shared/state/store.interface';
import { Users } from '@shared/state/users.actions';
import { IUserRow } from '@shared/state/users.interface';
import { getCurrentUser } from '@shared/state/users.selectors';
import { SharedValidator } from '@shared/validators/shared.validator';
import {
  getBusesIdsNames,
  IBusesIdsNames,
} from '@wks/state/buses/buses.selectors';
import { Workspaces } from '@wks/state/workspaces/workspaces.actions';
import { IWorkspaceRow } from '@wks/state/workspaces/workspaces.interface';
import {
  getCurrentWorkspace,
  getCurrentWorkspaceUsers,
  getUsersNotInCurrentWorkspace,
} from '@wks/state/workspaces/workspaces.selectors';

@Component({
  selector: 'app-workspace-overview',
  templateUrl: './workspace-overview.component.html',
  styleUrls: ['./workspace-overview.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class WorkspaceOverviewComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  busesIdsNames$: Observable<{ list: IBusesIdsNames[] }>;

  workspace$: Observable<IWorkspaceRow>;
  users$: Observable<IUserRow[]>;

  currentUserId$: Observable<string>;
  appUsers$: Observable<string[]>;

  isRemoving = false;

  isSettingShortDescription = false;
  isEditingShortDescription = false;

  isEditingDescription = false;
  isSettingDescription = false;

  isFocusDescriptionTextarea = false;
  isFocusShortDescriptionTextarea = false;

  shortDescription: string = null;
  description: string = null;

  addUserFormGroup: FormGroup;
  filteredUsers$: Observable<string[]>;

  matcher = new FormErrorStateMatcher();

  constructor(
    private fb: FormBuilder,
    private store$: Store<IStore>,
    private dialog: MatDialog,
    private actions$: Actions
  ) {}

  ngOnInit() {
    this.store$.dispatch(new Users.FetchAll());

    this.busesIdsNames$ = this.store$.pipe(getBusesIdsNames);

    this.appUsers$ = this.store$.pipe(
      select(getUsersNotInCurrentWorkspace),
      map(us => us.map(u => u.id).sort())
    );

    this.addUserFormGroup = this.fb.group({
      userSearchCtrl: [
        '',
        Validators.required,
        [SharedValidator.isStringInObsArrayValidator(this.appUsers$)],
      ],
    });

    this.currentUserId$ = this.store$.pipe(
      getCurrentUser,
      map(user => user.id)
    );

    this.workspace$ = this.store$.pipe(
      select(getCurrentWorkspace),
      tap(wks => {
        wks.isAddingUserToWorkspace
          ? this.addUserFormGroup.get('userSearchCtrl').disable()
          : this.addUserFormGroup.get('userSearchCtrl').enable();
      })
    );

    this.users$ = this.store$.pipe(getCurrentWorkspaceUsers);

    this.store$
      .pipe(
        // when we change workspace
        select(state => state.workspaces.selectedWorkspaceId),
        takeUntil(this.onDestroy$),
        tap(id => {
          // we reinit these in case one change workspace while editing
          this.shortDescription = null;
          this.description = null;
          this.isEditingShortDescription = false;
          this.isSettingShortDescription = false;
          this.isEditingDescription = false;
          this.isSettingDescription = false;
          this.isFocusDescriptionTextarea = false;
          this.store$.dispatch(new Workspaces.FetchDetails({ id }));
        })
      )
      .subscribe();

    this.workspace$
      .pipe(
        takeUntil(this.onDestroy$),
        // only when we are setting the description and it has finished
        filter(
          wks =>
            (!wks.isSettingDescription && this.isSettingDescription) ||
            (!wks.isSettingShortDescription && this.isSettingShortDescription)
        ),
        tap(_ => {
          if (!this.isSettingShortDescription) {
            this.description = null;
            this.isEditingDescription = false;
          }

          if (!this.isSettingDescription) {
            this.shortDescription = null;
            this.isEditingShortDescription = false;
          }

          // we reinit these, and it will show the current value of the description in the store
          this.isSettingShortDescription = false;
          this.isSettingDescription = false;
          this.isFocusDescriptionTextarea = false;
        })
      )
      .subscribe();

    this.filteredUsers$ = combineLatest(
      this.addUserFormGroup.get('userSearchCtrl').valueChanges,
      this.appUsers$
    ).pipe(map(([userSearch, users]) => this.filterUsers(userSearch, users)));

    // when a user is added to the workspace
    this.actions$
      .pipe(
        ofType(Workspaces.AddUserSuccessType),
        takeUntil(this.onDestroy$),
        // reset the form
        tap(_ => this.addUserFormGroup.reset())
      )
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
    this.workspace$
      .pipe(
        first(),
        tap(ws => {
          this.description = ws.description;
          this.isFocusDescriptionTextarea = true;
        })
      )
      .subscribe();
  }

  editShortDescription() {
    this.isEditingShortDescription = true;
    this.workspace$
      .pipe(
        first(),
        tap(wks => {
          this.shortDescription = wks.shortDescription;
          this.isFocusShortDescriptionTextarea = true;
        })
      )
      .subscribe();
  }

  cancelDescription() {
    this.description = null;
    this.isEditingDescription = false;
    this.isSettingDescription = false;
    this.isFocusDescriptionTextarea = false;
  }

  cancelShortDescription() {
    this.shortDescription = null;
    this.isEditingShortDescription = false;
    this.isSettingShortDescription = false;
    this.isFocusShortDescriptionTextarea = false;
  }

  saveDescription() {
    this.isSettingDescription = true;
    const description = this.description;
    this.workspace$
      .pipe(
        first(),
        tap(wks => {
          this.store$.dispatch(
            new Workspaces.SetDescription({ id: wks.id, description })
          );
        })
      )
      .subscribe();
  }

  saveShortDescription() {
    this.isSettingShortDescription = true;
    const shortDescription = this.shortDescription;
    this.workspace$
      .pipe(
        first(),
        tap(wks => {
          this.store$.dispatch(
            new Workspaces.SetShortDescription({ id: wks.id, shortDescription })
          );
        })
      )
      .subscribe();
  }

  openDeletionDialog() {
    this.isRemoving = true;
    this.workspace$
      .pipe(
        first(),
        switchMap(wks =>
          this.dialog
            .open(WorkspaceDeleteDialogComponent, {
              data: { name: wks.name },
            })
            .afterClosed()
            .pipe(
              map(res => !!res),
              tap(result => (this.isRemoving = result)),
              filter(result => result),
              tap(_ =>
                this.store$.dispatch(new Workspaces.Delete({ id: wks.id }))
              )
            )
        )
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
    <div fxLayout="column" class="content">
      <div class="central-content">
        <div fxLayout="row" matDialogTitle fxLayoutAlign="start start">
          <span fxLayoutAlign="start center">
            <mat-icon color="accent">warning</mat-icon>
            <span class="margin-left-x1">Delete workspace?</span>
          </span>
        </div>
        <mat-dialog-content>
          <p fxLayout="column" class="mat-body-1">
            <span>Everything in the workspace will be deleted! <b>Please, be certain</b>.</span>
            <span class="margin-top-x1">Are you sure you want to delete <b>{{ data.name }}</b>?</span>
          </p>
        </mat-dialog-content>

        <mat-dialog-actions class="margin-top-x1" fxLayout="row" fxLayoutAlign="end center">
          <button mat-button matDialogClose class="btn-cancel-delete-wks margin-right-x1">Cancel</button>
          <button mat-raised-button color="warn" class="btn-confirm-delete-wks" (click)="dialogRef.close(true)">Delete</button>
        </mat-dialog-actions>
      </div>
    </div>
  `,
  styles: ['.central-content { padding: 24px; }'],
})
export class WorkspaceDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<WorkspaceDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { name: string }
  ) {}
}
