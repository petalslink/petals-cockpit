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
import { ConfirmMessageDialogComponent } from '@shared/components/confirm-message-dialog/confirm-message-dialog.component';
import { getFormErrors } from '@shared/helpers/form.helper';
import { IUserNew } from '@shared/services/users.service';
import { ICurrentUser, IUser } from '@shared/state/users.interface';

@Component({
  selector: 'app-add-edit-user',
  templateUrl: './add-edit-user.component.html',
  styleUrls: ['./add-edit-user.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddEditUserComponent implements OnInit, OnDestroy, OnChanges {
  onDestroy$ = new Subject<void>();

  @Input() user?: IUser;
  @Input() currentUser?: ICurrentUser;
  @Input() isLastAdmin?: boolean;
  @Input() canDelete = false;

  @Output()
  evtSubmit = new EventEmitter<
    IUserNew | { name?: string; password?: string; isAdmin?: boolean }
  >();
  @Output() evtDelete = new EventEmitter<void>();
  @Output() evtCancel = new EventEmitter<void>();

  isModifyingAdministrator: boolean;

  userManagementForm: FormGroup;

  formErrors = {
    username: '',
    name: '',
    password: '',
    isAdmin: false,
  };

  constructor(private fb: FormBuilder, private dialog: MatDialog) {}

  ngOnInit() {
    this.userManagementForm = this.fb.group({
      username: ['', Validators.required],
      name: ['', Validators.required],
      password: '',
      isAdmin: false,
    });

    this.reset();

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
    if (changes['user']) {
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

    if (this.user) {
      this.userManagementForm.controls['password'].clearValidators();
    } else {
      this.userManagementForm.controls['password'].setValidators([
        Validators.required,
      ]);
    }

    this.userManagementForm.reset({
      username: this.user ? this.user.id : '',
      name: this.user ? this.user.name : '',
      password: '',
      isAdmin: this.user ? this.user.isAdmin : false,
    });
  }

  doCancel() {
    this.evtCancel.emit();
    this.reset();
  }

  doSubmit() {
    const value: IUserNew = this.userManagementForm.value;
    if (this.user) {
      const u: { name?: string; password?: string; isAdmin?: boolean } = {};
      if (value.name !== this.user.name) {
        u.name = value.name;
      }
      if (value.password && value.password !== '') {
        u.password = value.password;
      }
      if (value.isAdmin !== this.user.isAdmin) {
        u.isAdmin = value.isAdmin;
      }
      if (u.name || u.password || u.isAdmin === value.isAdmin) {
        if (this.currentUser.id === this.user.id && !value.isAdmin) {
          this.isModifyingAdministrator = true;
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
              tap(result => {
                if (
                  result &&
                  (u.name || u.password || u.isAdmin === value.isAdmin)
                ) {
                  this.evtSubmit.emit(u);
                } else {
                  this.evtCancel.emit();
                  this.isModifyingAdministrator = false;
                }
              })
            )
            .subscribe();
        } else {
          this.evtSubmit.emit(u);
        }
      } else {
        this.evtCancel.emit();
      }
    } else {
      this.evtSubmit.emit(value);
    }
    this.reset();
  }
  
  userUnchanged() {
    return (
      this.user &&
      this.userManagementForm.get('name').value === this.user.name &&
      this.userManagementForm.get('isAdmin').value === this.user.isAdmin &&
      this.userManagementForm.get('password').value === ''
    );
  }

  doDelete() {
    this.evtDelete.emit();
  }
}
