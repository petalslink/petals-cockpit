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
  Input,
  Output,
  EventEmitter,
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs/Subject';

import { IUser } from 'app/shared/state/users.interface';
import { IUserNew } from 'app/shared/services/users.service';
import { getFormErrors } from 'app/shared/helpers/form.helper';

@Component({
  selector: 'app-add-edit-user',
  templateUrl: './add-edit-user.component.html',
  styleUrls: ['./add-edit-user.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddEditUserComponent implements OnInit, OnDestroy {
  onDestroy$ = new Subject<void>();

  @Input() user?: IUser;
  @Input() canDelete = true;

  @Output()
  submit = new EventEmitter<IUserNew | { name?: string; password?: string }>();
  @Output() delete = new EventEmitter<IUser | { id?: string }>();
  @Output() cancel = new EventEmitter<void>();

  userManagementForm: FormGroup;

  formErrors = {
    username: '',
    name: '',
    password: '',
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.userManagementForm = this.fb.group({
      username: ['', [Validators.required]],
      name: ['', [Validators.required]],
      password: ['', this.user ? [] : [Validators.required]],
    });

    this.reset();

    this.userManagementForm.valueChanges
      .takeUntil(this.onDestroy$)
      .do(() => {
        this.formErrors = getFormErrors(
          this.userManagementForm,
          this.formErrors
        );
      })
      .subscribe();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  reset() {
    this.userManagementForm.reset({
      username: this.user ? this.user.id : '',
      name: this.user ? this.user.name : '',
      password: '',
    });
  }

  doCancel() {
    this.cancel.emit();
    this.reset();
  }

  doSubmit() {
    const value: IUserNew = this.userManagementForm.value;
    if (this.user) {
      const u: { name?: string; password?: string } = {};
      if (value.name !== this.user.name) {
        u.name = value.name;
      }
      if (value.password && value.password !== '') {
        u.password = value.password;
      }
      if (u.name || u.password) {
        this.submit.emit(u);
      } else {
        this.cancel.emit();
      }
    } else {
      this.submit.emit(value);
    }
    this.reset();
  }

  doDelete() {
    const value: IUser = this.userManagementForm.value;
    this.delete.emit(value);
  }
}
