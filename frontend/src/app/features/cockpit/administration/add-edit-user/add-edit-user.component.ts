/**
 * Copyright (C) 2017-2018 Linagora
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

import { getFormErrors } from '@shared/helpers/form.helper';
import { IUserNew } from '@shared/services/users.service';
import { IUser } from '@shared/state/users.interface';

@Component({
  selector: 'app-add-edit-user',
  templateUrl: './add-edit-user.component.html',
  styleUrls: ['./add-edit-user.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddEditUserComponent implements OnInit, OnDestroy, OnChanges {
  onDestroy$ = new Subject<void>();

  @Input() user?: IUser;
  @Input() canDelete = false;

  @Output()
  evtSubmit = new EventEmitter<
    IUserNew | { name?: string; password?: string }
  >();
  @Output() evtDelete = new EventEmitter<void>();
  @Output() evtCancel = new EventEmitter<void>();

  userManagementForm: FormGroup;

  formErrors = {
    username: '',
    name: '',
    password: '',
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.userManagementForm = this.fb.group({
      username: ['', Validators.required],
      name: ['', Validators.required],
      password: '',
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
    });
  }

  doCancel() {
    this.evtCancel.emit();
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
        this.evtSubmit.emit(u);
      } else {
        this.evtCancel.emit();
      }
    } else {
      this.evtSubmit.emit(value);
    }
    this.reset();
  }

  doDelete() {
    this.evtDelete.emit();
  }
}
