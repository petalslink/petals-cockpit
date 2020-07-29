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

import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { Actions, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { combineLatest, Observable, Subject } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  first,
  map,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { ConfirmMessageDialogComponent } from '@shared/components/confirm-message-dialog/confirm-message-dialog.component';

import { CustomValidators } from '@shared/helpers/custom-validators';
import {
  FormErrorStateMatcher,
  getFormErrors,
} from '@shared/helpers/form.helper';
import { IBusImport } from '@shared/services/buses.service';
import { IStore } from '@shared/state/store.interface';
import { Users } from '@shared/state/users.actions';
import { ICurrentUser, IUserRow } from '@shared/state/users.interface';
import { getConnectedUser } from '@shared/state/users.selectors';
import { SharedValidator } from '@shared/validators/shared.validator';
import { Buses } from '@wks/state/buses/buses.actions';
import { IBusRow } from '@wks/state/buses/buses.interface';
import {
  getBuses,
  getBusImportProgressStatus,
  getImportBusError,
} from '@wks/state/buses/buses.selectors';
import { Workspaces } from '@wks/state/workspaces/workspaces.actions';
import {
  IWorkspaceRow,
  IWorkspaceUserPermissions,
  IWorkspaceUserRow,
} from '@wks/state/workspaces/workspaces.interface';
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
  matcher = new FormErrorStateMatcher();

  // delete workspace
  workspace$: Observable<IWorkspaceRow>;
  isRemoving = false;

  // edit workspace details
  wksDetailsFormGroup: FormGroup;
  editWksDetailsFormErrors = {
    workspaceName: '',
    shortDescription: '',
    description: '',
  };

  // buses
  buses$: Observable<{ list: IBusRow[] }>;
  buses: IBusRow[];

  // import/attach bus
  busImportFormGroup: FormGroup;
  isEditingImportBus = false;
  isImportingBus = false;
  disabledCancelBtn = false;
  disabledAttachBtn = false;
  editBusFormErrors = {
    ip: '',
    port: '',
    username: '',
    password: '',
    passphrase: '',
  };
  importBusId: string;
  importBusError: string = null;
  importError: string = null;
  busFormDefault = {
    ip: 'localhost',
    port: 7700,
    username: 'petals',
    password: 'petals',
    passphrase: 'petals',
  };

  // edit/detach bus
  busSelected: IBusRow;
  isEditingBusList = false;
  isDetaching = false;
  disabledDetachBtn = false;

  // workspace users management
  users$: Observable<IWorkspaceUserRow[]>;
  isAllowedAsAdminWorkspace = false;
  appUsers$: Observable<string[]>;
  filteredUsers$: Observable<string[]>;
  addUserFormGroup: FormGroup;
  usersFormGroup: FormGroup;
  currentUser: ICurrentUser;

  displayedColumns: string[] = [
    'name',
    'id',
    'adminWorkspace',
    'deployArtifact',
    'lifecycleArtifact',
    'action',
  ];
  permissions: {
    id: string;
    label: string;
  }[] = [
    {
      id: 'adminWorkspace',
      label: 'Admin Workspace',
    },
    {
      id: 'deployArtifact',
      label: 'Deploy Artifact',
    },
    {
      id: 'lifecycleArtifact',
      label: 'Lifecycle Artifact',
    },
  ];

  usersPermissionsChanged: {
    id: string;
    adminWorkspace: boolean;
    deployArtifact: boolean;
    lifecycleArtifact: boolean;
  }[];

  isLastAdminRemaining = false;

  constructor(
    private fb: FormBuilder,
    private store$: Store<IStore>,
    private dialog: MatDialog,
    private actions$: Actions
  ) {}

  ngOnInit() {
    this.store$.dispatch(new Users.FetchAll());

    this.buses$ = this.store$.pipe(
      getBuses,
      tap(buses => (this.buses = buses.list))
    );

    this.store$
      .pipe(
        select(getConnectedUser),
        takeUntil(this.onDestroy$),
        tap(user => {
          this.currentUser = user;

          this.isAllowedAsAdminWorkspace = user.isAdmin
            ? true
            : user.workspacePermissions &&
              user.workspacePermissions.adminWorkspace;
        })
      )
      .subscribe();

    this.createFormImportBus();

    this.appUsers$ = this.store$.pipe(
      select(getUsersNotInCurrentWorkspace),
      map(users => {
        // TODO: we should not retrieve the cockpit users if the current user has not adminWorkspace
        // See: https://gitlab.com/linagora/petals-cockpit/-/issues/692
        if (!this.isAllowedAsAdminWorkspace) {
          this.addUserFormGroup.reset();
          this.addUserFormGroup.disable();
        }
        return users.map(u => u.id).sort();
      })
    );

    this.createFormAddUser();

    this.workspace$ = this.store$.pipe(
      select(getCurrentWorkspace),
      tap(wks => {
        wks.isAddingUserToWorkspace
          ? this.addUserFormGroup.disable()
          : this.addUserFormGroup.enable();
      })
    );

    this.users$ = this.store$.pipe(getCurrentWorkspaceUsers).pipe(
      takeUntil(this.onDestroy$),
      tap(users => {
        if (!this.isSavingUsersPermissions(users)) {
          this.isLastAdminRemaining = !users.some(
            user => user.id !== this.currentUser.id && user.adminWorkspace
          );

          this.usersPermissionsChanged = users.map(user => {
            return {
              id: user.id,
              adminWorkspace: false,
              deployArtifact: false,
              lifecycleArtifact: false,
            };
          });

          this.updateUsersFormGroup(users);
        }
      })
    );

    this.store$
      .pipe(
        // when we change workspace
        select(state => state.workspaces.selectedWorkspaceId),
        takeUntil(this.onDestroy$),
        tap(id => {
          // we reinit these in case one change workspace while editing
          this.importBusError = null;
          this.importError = null;

          this.addUserFormGroup.reset();

          this.store$.dispatch(
            new Workspaces.EditWorkspaceDetails({
              id,
              isEditDetailsMode: false,
            })
          );
          this.store$.dispatch(new Workspaces.FetchDetails({ id }));
        })
      )
      .subscribe();

    this.createFormUpdateWorkspaceDetails();
    this.workspace$
      .pipe(
        takeUntil(this.onDestroy$),
        map(wks => wks.isUpdatingDetails),
        distinctUntilChanged(),
        tap(isUpdatingDetails => {
          isUpdatingDetails
            ? this.wksDetailsFormGroup.disable()
            : this.wksDetailsFormGroup.enable();
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
        ofType(Workspaces.AddWorkspaceUserSuccessType),
        takeUntil(this.onDestroy$),
        tap(_ => this.addUserFormGroup.reset())
      )
      .subscribe();

    this.store$
      .pipe(
        select(getImportBusError),
        takeUntil(this.onDestroy$),
        tap(error => {
          if (error.importBusError) {
            this.importBusError = error.importBusError;
          } else if (error.importError) {
            this.importError = error.importError;
          }

          this.disabledCancelBtn = false;
          this.disabledAttachBtn = false;
        })
      )
      .subscribe();

    this.store$
      .pipe(
        select(state => state.buses.isImportingBus),
        takeUntil(this.onDestroy$),
        tap(isImportingBus => {
          this.isImportingBus = isImportingBus;

          isImportingBus
            ? this.busImportFormGroup.disable()
            : this.busImportFormGroup.enable();
        })
      )
      .subscribe();

    this.store$
      .pipe(
        select(getBusImportProgressStatus),
        takeUntil(this.onDestroy$),
        tap(dialogImportBus => {
          if (dialogImportBus.importBusId) {
            this.dialog
              .open(BusImportDialogComponent, {
                disableClose: true,
              })
              .afterOpen();
          } else {
            this.disabledCancelBtn = false;
            this.disabledAttachBtn = false;
          }
        })
      )
      .subscribe();

    // when a new bus is attached to the workspace
    this.actions$
      .pipe(
        ofType(Buses.AddedType),
        takeUntil(this.onDestroy$),
        // reset the form and close attach bus part
        tap(_ => this.cancelAttachBus())
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();

    if (this.busSelected) {
      this.store$.dispatch(new Buses.CancelSelect({ id: this.busSelected.id }));
    }
  }

  /**
   * All functions used for the management part of the current workspace (edit workspace details).
   */
  createFormUpdateWorkspaceDetails() {
    this.wksDetailsFormGroup = this.fb.group({
      workspaceName: [
        '',
        Validators.compose([Validators.required, Validators.maxLength(100)]),
        CustomValidators.existingWorkspaceWithSimilarNameValidator(this.store$),
      ],
      shortDescription: ['', Validators.maxLength(200)],
      description: '',
    });

    this.wksDetailsFormGroup.valueChanges
      .pipe(
        takeUntil(this.onDestroy$),
        tap(() => {
          this.editWksDetailsFormErrors = getFormErrors(
            this.wksDetailsFormGroup,
            this.editWksDetailsFormErrors
          );
        })
      )
      .subscribe();
  }

  editWorkspaceDetails(id: string) {
    this.store$.dispatch(
      new Workspaces.EditWorkspaceDetails({
        id,
        isEditDetailsMode: true,
      })
    );

    this.workspace$
      .pipe(
        first(),
        tap(wks => {
          this.wksDetailsFormGroup.get('workspaceName').setValue(wks.name);
          this.wksDetailsFormGroup.get('description').setValue(wks.description);
          this.wksDetailsFormGroup
            .get('shortDescription')
            .setValue(wks.shortDescription);
        })
      )
      .subscribe();
  }

  cancelEditWorkspaceDetails(id: string) {
    this.store$.dispatch(
      new Workspaces.EditWorkspaceDetails({
        id,
        isEditDetailsMode: false,
      })
    );
  }

  onSubmitWorkspaceDetails() {
    this.workspace$
      .pipe(
        first(),
        tap(wks => {
          this.store$.dispatch(
            new Workspaces.UpdateWorkspaceDetails({
              id: wks.id,
              name: this.wksDetailsFormGroup.value.workspaceName,
              shortDescription: this.wksDetailsFormGroup.value.shortDescription,
              description: this.wksDetailsFormGroup.value.description,
            })
          );
        })
      )
      .subscribe();
  }

  hasWorkspaceDetailsChanged(
    name: string,
    shortDescription: string,
    description: string
  ): boolean {
    return (
      name !== this.wksDetailsFormGroup.value.workspaceName ||
      shortDescription !== this.wksDetailsFormGroup.value.shortDescription ||
      description !== this.wksDetailsFormGroup.value.description
    );
  }

  /**
   * All functions used for the users management part in the current workspace (add, remove user).
   */
  createFormAddUser() {
    this.addUserFormGroup = this.fb.group({
      userSearchCtrl: [
        '',
        Validators.required,
        [SharedValidator.isStringInObsArrayValidator(this.appUsers$)],
      ],
    });
  }

  filterUsers(search: string, users: string[]) {
    return search ? users.filter(user => user.includes(search)) : users;
  }

  addUser() {
    const id = this.addUserFormGroup.get('userSearchCtrl').value;
    this.store$.dispatch(new Workspaces.AddWorkspaceUser({ id }));

    this.usersFormGroup.disable();
  }

  get usersFormArray(): FormArray {
    return this.usersFormGroup.get('usersFormArray') as FormArray;
  }

  onSubmitUsersPermissions() {
    this.usersPermissionsChanged
      .filter(
        user =>
          user.adminWorkspace || user.deployArtifact || user.lifecycleArtifact
      )
      .map(user => {
        const userForm = this.usersFormArray.controls.find(
          userFormArray => userFormArray.value.id === user.id
        );

        this.store$.dispatch(
          new Workspaces.UpdateWorkspaceUserPermissions({
            userId: userForm.value.id,
            permissions: {
              adminWorkspace: userForm.value.adminWorkspace,
              deployArtifact: userForm.value.deployArtifact,
              lifecycleArtifact: userForm.value.lifecycleArtifact,
            },
          })
        );
      });

    this.usersFormGroup.disable();
  }

  updateUsersFormGroup(users: IWorkspaceUserRow[]) {
    const userListFormGroup: FormGroup[] = users.map(u => {
      return this.fb.group({
        id: u.id,
        name: u.name,
        adminWorkspace: {
          value: u.adminWorkspace,
          disabled: false,
        },
        deployArtifact: {
          value: u.deployArtifact,
          disabled: false,
        },
        lifecycleArtifact: {
          value: u.lifecycleArtifact,
          disabled: false,
        },
      });
    });

    this.usersFormGroup = this.fb.group({
      usersFormArray: this.fb.array(userListFormGroup),
    });
  }

  onUserPermissionChange(
    usersStored: IWorkspaceUserRow[],
    permissionId: keyof IWorkspaceUserPermissions,
    index: number
  ) {
    const userChanged = this.usersPermissionsChanged.find(
      user => user.id === this.usersFormArray.controls[index].value.id
    );
    userChanged[permissionId] =
      usersStored.find((user: IWorkspaceUserRow) => user.id === userChanged.id)[
        permissionId
      ] !== this.usersFormArray.controls[index].value[permissionId];
  }

  isSavingUsersPermissions(usersStored: IWorkspaceUserRow[]): boolean {
    return !!usersStored.find(user => user.isSavingUserPermissions);
  }

  getCheckBoxColor(
    usersStored: IWorkspaceUserRow[],
    permissionId: keyof IWorkspaceUserPermissions,
    index: number
  ) {
    const userForm = this.usersFormArray.controls[index].value;
    if (
      this.isAllowedAsAdminWorkspace &&
      userForm.hasOwnProperty(permissionId)
    ) {
      return usersStored.find(
        user =>
          user.id === userForm.id &&
          user[permissionId] === userForm[permissionId]
      )
        ? 'primary'
        : 'accent';
    } else {
      return 'primary';
    }
  }

  isUnchecked(
    usersStored: IWorkspaceUserRow[],
    userForm: FormGroup,
    permissionId: keyof IWorkspaceUserPermissions
  ) {
    if (
      this.isAllowedAsAdminWorkspace &&
      userForm.value.hasOwnProperty(permissionId)
    ) {
      return usersStored.find(
        user =>
          user.id === userForm.value.id &&
          user[permissionId] &&
          !userForm.value[permissionId]
      );
    }
  }

  hasAnyUserChanged(): boolean {
    return !this.usersPermissionsChanged.find(
      user =>
        user.adminWorkspace || user.deployArtifact || user.lifecycleArtifact
    );
  }

  hasPermissionChanged(
    index: number,
    permissionId: keyof IWorkspaceUserPermissions
  ): boolean {
    return this.usersPermissionsChanged[index][permissionId];
  }

  removeUser(id: string) {
    const currentUserSelfRemoving = this.currentUser.id === id;

    if (currentUserSelfRemoving) {
      this.dialog
        .open(ConfirmMessageDialogComponent, {
          data: {
            title: 'Leave this workspace?',
            message:
              'You will no longer be member of this workspace.\nYou will be redirected to the workspaces selection page.',
            confirmButtonText: 'LEAVE',
          },
        })
        .beforeClose()
        .pipe(
          tap(confirm => {
            if (confirm) {
              this.store$.dispatch(new Workspaces.DeleteUser({ id }));
              this.usersFormGroup.disable();
            } else if (this.isAllowedAsAdminWorkspace) {
              this.usersFormGroup.enable();
            }
          })
        )
        .subscribe();
    } else {
      this.store$.dispatch(new Workspaces.DeleteUser({ id }));
      this.usersFormGroup.disable();
    }
  }

  trackByUser(i: number, user: IUserRow) {
    return user.id;
  }

  /**
   * All functions used for the management part of the current workspace (delete workspace).
   */
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
            .beforeClose()
            .pipe(
              map(res => !!res),
              tap(result => (this.isRemoving = result)),
              filter(result => result),
              tap(_ => {
                this.store$.dispatch(new Workspaces.Delete({ id: wks.id }));
              })
            )
        )
      )
      .subscribe();
  }

  /**
   * All functions used for the bus list management part in the current workspace (detach bus).
   */
  toggleSelectDetachBus(id: string) {
    this.buses.map((bus: IBusRow) => {
      if (bus.id === id) {
        this.store$.dispatch(new Buses.ToggleSelect({ id }));
        if (!this.busSelected) {
          // select if no bus selected
          this.busSelected = bus;
          this.disabledDetachBtn = false;
        } else if (this.busSelected.id === id) {
          // select the same previous bus selected
          this.busSelected = null;
          this.disabledDetachBtn = true;
        } else {
          this.busSelected = bus;
        }
      } else if (bus.id !== id && bus.isBusSelectedForDetachment) {
        // select other bus
        this.store$.dispatch(new Buses.ToggleSelect({ id: bus.id }));
        this.disabledDetachBtn = false;
      }
    });
  }

  isBusDetaching() {
    for (const bus of this.buses) {
      if (bus.isDetaching) {
        return true;
      }
    }
    return false;
  }

  isBusSelectedForDetachment() {
    for (const bus of this.buses) {
      if (bus.isBusSelectedForDetachment) {
        return true;
      }
    }
    return false;
  }

  editDetachBus() {
    this.isEditingBusList = true;
    this.disabledDetachBtn = true;
  }

  cancelDetachBus() {
    this.isEditingBusList = false;
    this.disabledDetachBtn = false;

    if (this.busSelected) {
      this.store$.dispatch(new Buses.CancelSelect({ id: this.busSelected.id }));
      this.busSelected = null;
    }
  }

  openDetachBusDialog() {
    this.isDetaching = true;
    this.disabledDetachBtn = true;

    this.dialog
      .open(BusDetachDialogComponent, {
        data: { name: this.busSelected.name },
      })
      .beforeClose()
      .pipe(
        map(res => !!res),
        tap(result => {
          this.isDetaching = result;
          this.disabledDetachBtn = false;
        }),
        filter(result => result),
        tap(_ => {
          this.store$.dispatch(new Buses.Detach({ id: this.busSelected.id }));
          this.isEditingBusList = false;
          this.busSelected = null;
        })
      )
      .subscribe();
  }

  /**
   * All functions used for the bus list management part in the current workspace (attach bus).
   */
  createFormImportBus() {
    this.busImportFormGroup = this.fb.group({
      ip: '',
      port: ['', CustomValidators.isPortOrNull],
      username: '',
      password: '',
      passphrase: '',
    });

    this.busImportFormGroup.valueChanges
      .pipe(
        takeUntil(this.onDestroy$),
        tap(() => {
          this.editBusFormErrors = getFormErrors(
            this.busImportFormGroup,
            this.editBusFormErrors
          );
        })
      )
      .subscribe();
  }

  resetFormImportBus() {
    this.busImportFormGroup.reset();
    this.store$.dispatch(new Buses.CleanImport());

    this.importError = null;
    this.importBusError = null;
  }

  editAttachBus() {
    this.isEditingImportBus = true;
  }

  cancelAttachBus() {
    this.isEditingImportBus = false;
    this.disabledAttachBtn = false;

    this.resetFormImportBus();
  }

  getError() {
    // post bus error
    if (this.importError) {
      return this.importError;
      // sse bus import error
    } else if (this.importBusError) {
      return this.importBusError;
    } else {
      return undefined;
    }
  }

  onSubmitBus({ value }: { value: IBusImport; valid: boolean }) {
    this.disabledCancelBtn = true;
    this.disabledAttachBtn = true;

    const importBusDefault: IBusImport = {
      ip: value.ip ? value.ip : this.busFormDefault.ip,
      port: value.port ? value.port : this.busFormDefault.port,
      username: value.username ? value.username : this.busFormDefault.username,
      password: value.password ? value.password : this.busFormDefault.password,
      passphrase: value.passphrase
        ? value.passphrase
        : this.busFormDefault.passphrase,
    };

    this.store$.dispatch(new Buses.Post(importBusDefault));
  }
}

/**
 * This dialog component is required to inform user of irreversible deletion of the current
 * workspace (confirm delete bus).
 **/
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
          <p fxLayout="column">
            <span
              >This will delete <b>{{ data.name }}</b> along with its settings
              (members, permissions, descriptions).</span
            >
            <span>Buses will be detached.</span>
          </p>
        </mat-dialog-content>

        <mat-dialog-actions fxLayout="row" fxLayoutAlign="end center">
          <button
            mat-button
            color="primary"
            (click)="close()"
            class="btn-cancel-delete-wks margin-right-x1 text-upper"
          >
            Cancel
          </button>
          <button
            mat-raised-button
            color="warn"
            [matDialogClose]="data.name"
            (click)="delete()"
            class="btn-confirm-delete-wks text-upper"
          >
            Delete
          </button>
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

  close() {
    this.dialogRef.close();
  }

  delete() {
    this.dialogRef.close(true);
  }
}

/**
 * This dialog component is required to inform user of the bus detachment in the current workspace
 * (confirm detach bus).
 **/
@Component({
  selector: 'app-bus-detach-dialog',
  template: `
    <div fxLayout="column" class="content">
      <div class="central-content">
        <div fxLayout="row" matDialogTitle fxLayoutAlign="start start">
          <span fxLayoutAlign="start center">
            <mat-icon color="accent">warning</mat-icon>
            <span class="warning-title margin-left-x1">Detach bus?</span>
          </span>
        </div>
        <mat-dialog-content>
          <p fxLayout="column">
            <span
              >This will detach <b>{{ data.name }}</b
              >.</span
            >
          </p>
        </mat-dialog-content>

        <mat-dialog-actions fxLayout="row" fxLayoutAlign="end center">
          <button
            mat-button
            color="primary"
            (click)="close()"
            class="btn-cancel-detach-bus-dialog margin-right-x1 text-upper"
          >
            Cancel
          </button>
          <button
            mat-raised-button
            color="primary"
            [matDialogClose]="data.name"
            (click)="detach()"
            class="btn-confirm-detach-bus-dialog text-upper"
          >
            Detach
          </button>
        </mat-dialog-actions>
      </div>
    </div>
  `,
  styles: ['.central-content { padding: 24px; }'],
})
export class BusDetachDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<BusDetachDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { name: string }
  ) {}

  close() {
    this.dialogRef.close();
  }

  detach() {
    this.dialogRef.close(true);
  }
}

/**
 * This dialog component is required to inform user of the new bus attachment in the current
 * workspace (confirm attach bus).
 **/
@Component({
  selector: 'app-bus-import-dialog',
  template: `
    <div fxLayout="column" class="content">
      <div class="central-content">
        <div fxLayout="row" matDialogTitle fxLayoutAlign="start start">
          <span fxLayoutAlign="start center">
            <span class="warning-title">Import bus in progress...</span>
          </span>
        </div>
        <mat-dialog-content>
          <mat-progress-bar
            *ngIf="importBusId"
            mode="indeterminate"
          ></mat-progress-bar>
        </mat-dialog-content>

        <mat-dialog-actions fxLayout="row" fxLayoutAlign="end center">
          <button
            mat-button
            color="primary"
            [matDialogClose]="importBusId"
            (click)="cancel()"
            [disabled]="isCancelingImportBus"
            class="btn-cancel-import-bus-dialog text-upper"
          >
            <span
              *ngIf="isCancelingImportBus; else canCancel"
              fxLayout="row"
              fxLayoutAlign="start center"
            >
              Canceling
              <mat-spinner
                [diameter]="16"
                [strokeWidth]="1"
                class="margin-left-x1"
              ></mat-spinner>
            </span>

            <ng-template #canCancel>
              <span class="text-upper cancel-bus-text-btn">Cancel</span>
            </ng-template>
          </button>
        </mat-dialog-actions>
      </div>
    </div>
  `,
  styles: ['.central-content { padding: 24px; }'],
})
export class BusImportDialogComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  public importBusId: string;
  public isCancelingImportBus: boolean;

  constructor(
    private store$: Store<IStore>,
    public dialogRef: MatDialogRef<BusImportDialogComponent>
  ) {}

  ngOnInit() {
    this.store$
      .pipe(
        select(getBusImportProgressStatus),
        takeUntil(this.onDestroy$),
        tap(dialogImportBus => {
          if (!dialogImportBus.importBusId) {
            this.close();
          } else {
            this.importBusId = dialogImportBus.importBusId;
            this.isCancelingImportBus = dialogImportBus.isCancelingImportBus;
          }
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  close() {
    this.dialogRef.close();
  }

  cancel() {
    this.store$.dispatch(new Buses.CancelImport({ id: this.importBusId }));
  }
}
