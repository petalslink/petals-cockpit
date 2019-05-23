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
import { Buses } from '@wks/state/buses/buses.actions';
import { IBusRow } from '@wks/state/buses/buses.interface';
import { getBuses } from '@wks/state/buses/buses.selectors';
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

  buses$: Observable<{ list: IBusRow[] }>;

  workspace$: Observable<IWorkspaceRow>;
  users$: Observable<IUserRow[]>;

  currentUserId$: Observable<string>;
  appUsers$: Observable<string[]>;

  busSelected: IBusRow;
  buses: IBusRow[];
  disabledDetachBtn = false;

  isRemoving = false;
  isDetaching = false;

  isEditingDescriptions = false;
  isSettingDescriptions = false;

  isEditingBusList = false;
  isSettingBusList = false;

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

    this.buses$ = this.store$.pipe(
      getBuses,
      tap(buses => (this.buses = buses.list))
    );

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

          this.isEditingDescriptions = false;
          this.isSettingDescriptions = false;
          this.isFocusShortDescriptionTextarea = false;
          this.store$.dispatch(new Workspaces.FetchDetails({ id }));
        })
      )
      .subscribe();

    this.workspace$
      .pipe(
        takeUntil(this.onDestroy$),
        // only when we are setting the descriptions and it has finished
        filter(wks => !wks.isSettingDescriptions && this.isSettingDescriptions),
        tap(_ => {
          this.shortDescription = null;
          this.description = null;

          this.isEditingDescriptions = false;

          // we reinit these, and it will show the current value of the descriptions in the store
          this.isSettingDescriptions = false;
          this.isFocusShortDescriptionTextarea = false;
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

  editDescriptions() {
    this.isEditingDescriptions = true;
    this.workspace$
      .pipe(
        first(),
        tap(wks => {
          this.description = wks.description;
          this.shortDescription = wks.shortDescription;
          this.isFocusShortDescriptionTextarea = true;
        })
      )
      .subscribe();
  }

  cancelDescriptions() {
    this.description = null;
    this.shortDescription = null;

    this.isEditingDescriptions = false;
    this.isSettingDescriptions = false;
    this.isFocusShortDescriptionTextarea = false;
  }

  saveDescriptions() {
    const description = this.description;
    const shortDescription = this.shortDescription;
    this.workspace$
      .pipe(
        first(),
        tap(wks => {
          this.store$.dispatch(
            new Workspaces.SetDescriptions({
              id: wks.id,
              shortDescription,
              description,
            })
          );
          this.isSettingDescriptions = true;
        })
      )
      .subscribe();
  }

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
    this.isSettingBusList = false;
    this.isEditingBusList = true;
    this.disabledDetachBtn = true;
  }

  cancelDetachBus() {
    this.isEditingBusList = false;
    this.disabledDetachBtn = false;

    if (this.busSelected) {
      this.store$.dispatch(new Buses.CancelSelect({ id: this.busSelected.id }));
      this.busSelected = null;
      this.isSettingBusList = true;
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
          this.isSettingBusList = true;
          this.busSelected = null;
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

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();

    if (this.busSelected) {
      this.store$.dispatch(new Buses.CancelSelect({ id: this.busSelected.id }));
    }
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
            <span>This will delete <b>{{ data.name }}</b> along with its settings (members, permissions, descriptions).</span>
            <span>Buses will be detached.</span>
          </p>
        </mat-dialog-content>

        <mat-dialog-actions fxLayout="row" fxLayoutAlign="end center">
          <button mat-button color="primary" (click)="close()" class="btn-cancel-delete-wks margin-right-x1 text-upper">Cancel</button>
          <button mat-raised-button color="warn" (click)="delete()" [matDialogClose]="data.name" class="btn-confirm-delete-wks text-upper">Delete</button>
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
          <p fxLayout="column" class="mat-body-1">
            <span>This will detach <b>{{ data.name }}</b>.</span>
          </p>
        </mat-dialog-content>

        <mat-dialog-actions fxLayout="row" fxLayoutAlign="end center">
          <button mat-button color="primary" (click)="close()" class="btn-cancel-detach-bus-dialog margin-right-x1 text-upper">Cancel</button>
          <button mat-raised-button color="primary" (click)="detach()" [matDialogClose]="data.name" class="btn-confirm-detach-bus-dialog text-upper">Detach</button>
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
