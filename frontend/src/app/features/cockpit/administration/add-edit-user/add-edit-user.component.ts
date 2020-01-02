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
      username: [this.user ? this.user.id : '', Validators.required],
      name: [this.user ? this.user.name : '', Validators.required],
      password: ['', this.user ? '' : Validators.required],
      isAdmin: this.user ? this.user.isAdmin : true,
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
    const u: { name?: string; password?: string; isAdmin?: boolean } = {};

    if (!this.user) {
      this.evtSubmit.emit(value);
    } else {
      if (value.name !== this.user.name) {
        u.name = value.name;
      }
      if (value.password && value.password !== '') {
        u.password = value.password;
      }
      if (value.isAdmin !== null) {
        u.isAdmin = value.isAdmin;
      }
      const currentUserSelfDemoting =
        this.user && this.currentUser.id === this.user.id && !value.isAdmin;
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

  userUnchanged() {
    return (
      this.user &&
      this.userManagementForm.value.name === this.user.name &&
      this.userManagementForm.value.isAdmin === this.user.isAdmin &&
      this.userManagementForm.value.password === ''
    );
  }

  doDelete() {
    this.evtDelete.emit();
  }
}
