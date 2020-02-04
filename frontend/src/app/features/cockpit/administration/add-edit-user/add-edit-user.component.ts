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
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { ConfirmMessageDialogComponent } from '@shared/components/confirm-message-dialog/confirm-message-dialog.component';
import { CustomValidators } from '@shared/helpers/custom-validators';
import {
  FormErrorStateMatcher,
  getFormErrors,
} from '@shared/helpers/form.helper';
import { IUserNew } from '@shared/services/users.service';
import { IStore } from '@shared/state/store.interface';
import { ICurrentUser, IUser } from '@shared/state/users.interface';

@Component({
  selector: 'app-add-edit-user',
  templateUrl: './add-edit-user.component.html',
  styleUrls: ['./add-edit-user.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddEditUserComponent implements OnInit, OnDestroy, OnChanges {
  onDestroy$ = new Subject<void>();

  @Input() editUser?: IUser;
  @Input() currentUser?: ICurrentUser;
  @Input() isLastAdmin?: boolean;
  @Input() canDelete = false;

  @Output()
  evtSubmit = new EventEmitter<
    IUserNew | { name?: string; password?: string; isAdmin?: boolean }
  >();
  @Output() evtDelete = new EventEmitter<void>();
  @Output() evtCancel = new EventEmitter<void>();

  userManagementForm: FormGroup;
  matcher = new FormErrorStateMatcher();

  formErrors = {
    username: '',
    name: '',
    password: '',
    isAdmin: false,
  };

  constructor(
    private store$: Store<IStore>,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.userManagementForm = this.fb.group({
      username: [
        this.editUser ? this.editUser.id : '',
        Validators.compose([
          Validators.required,
          CustomValidators.validCharactersUsernameValidator,
        ]),
        CustomValidators.existingUserWithSimilarUsernameValidator(
          this.store$,
          !this.editUser
        ),
      ],
      name: [this.editUser ? this.editUser.name : '', Validators.required],
      password: ['', this.editUser ? null : Validators.required],
      isAdmin: this.editUser ? this.editUser.isAdmin : false,
    });

    this.userManagementForm.valueChanges
      .pipe(
        takeUntil(this.onDestroy$),
        tap(() => {
          this.formErrors = getFormErrors(
            this.userManagementForm,
            this.formErrors
          );
        })
      )
      .subscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['user'] && changes['user'].previousValue === undefined) {
      this.reset();
    }
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  reset() {
    if (!this.userManagementForm) {
      return;
    }

    if (this.editUser) {
      this.userManagementForm.controls['password'].clearValidators();
    } else {
      this.userManagementForm.controls['password'].setValidators([
        Validators.required,
      ]);
    }

    this.userManagementForm.reset({
      username: this.editUser ? this.editUser.id : '',
      name: this.editUser ? this.editUser.name : '',
      password: '',
      isAdmin: this.editUser ? this.editUser.isAdmin : false,
    });
  }

  doCancel() {
    this.evtCancel.emit();
    this.reset();
  }

  doSubmit() {
    const value: IUserNew = this.userManagementForm.value;
    const u: { name?: string; password?: string; isAdmin?: boolean } = {};

    if (!this.editUser) {
      this.evtSubmit.emit(value);
    } else {
      if (value.name !== this.editUser.name) {
        u.name = value.name;
      }
      if (value.password && value.password !== '') {
        u.password = value.password;
      }
      if (value.isAdmin !== null) {
        u.isAdmin = value.isAdmin;
      }
      const currentUserSelfDemoting =
        this.editUser &&
        this.currentUser.id === this.editUser.id &&
        !value.isAdmin;
      if (currentUserSelfDemoting) {
        this.doSubmitSelfAdmin(u);
      } else {
        this.evtSubmit.emit(u);
      }
    }
  }

  private doSubmitSelfAdmin(value: {
    name?: string;
    password?: string;
    isAdmin?: boolean;
  }) {
    this.dialog
      .open(ConfirmMessageDialogComponent, {
        data: {
          title: 'Remove admin role?',
          message:
            'You will no longer be admin.\nYou will be redirected to the workspaces selection page.',
        },
      })
      .beforeClose()
      .pipe(
        tap(res => {
          if (res) {
            this.evtSubmit.emit(value);
          } else {
            this.evtCancel.emit();
          }
        })
      )
      .subscribe();
  }

  doDelete() {
    this.evtDelete.emit();
  }

  userUnchanged() {
    return (
      this.editUser &&
      this.userManagementForm.value.name === this.editUser.name &&
      this.userManagementForm.value.isAdmin === this.editUser.isAdmin &&
      this.userManagementForm.value.password === ''
    );
  }
}
