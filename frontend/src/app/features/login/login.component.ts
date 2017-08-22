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
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
  Validators,
} from '@angular/forms';
import { MdInputContainer } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { IStore } from '../../shared/state/store.interface';

import { formErrorStateMatcher } from 'app/shared/helpers/form.helper';
import { IUserLogin } from 'app/shared/services/users.service';
import { isLargeScreen } from 'app/shared/state/ui.selectors';
import { Users } from 'app/shared/state/users.actions';
import { getUsers } from 'app/shared/state/users.selectors';
import { IUsersTable } from '../../shared/state/users.interface';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {
  private onDestroy$ = new Subject<void>();

  @ViewChild('usernameInput') usernameInput: MdInputContainer;

  loginForm: FormGroup;
  users$: Observable<IUsersTable>;

  constructor(
    private store$: Store<IStore>,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.users$ = this.store$.select(getUsers);

    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });

    this.users$
      .takeUntil(this.onDestroy$)
      .do(users => {
        if (users.isConnecting || users.connectedUser) {
          this.loginForm.disable();
          this.loginForm.disable();
        } else {
          this.loginForm.enable();
          this.loginForm.enable();
        }
      })
      .subscribe();
  }

  createFormErrorStateMatcher(
    control: FormControl,
    formToCheck: FormGroupDirective | NgForm
  ): boolean {
    return formErrorStateMatcher(control, formToCheck);
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngAfterViewInit() {
    this.store$
      .let(isLargeScreen)
      .first()
      .filter(ss => ss)
      .do(_ => {
        this.usernameInput._focusInput();
        this.cdr.detectChanges();
      })
      .subscribe();
  }

  onSubmit({ value }: { value: IUserLogin }) {
    this.store$.dispatch(
      new Users.Connect({
        user: value,
        previousUrl: this.route.snapshot.queryParamMap.get('previousUrl'),
      })
    );
  }
}
