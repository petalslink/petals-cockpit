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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

import { FormErrorStateMatcher } from 'app/shared/helpers/form.helper';
import { IUserLogin } from 'app/shared/services/users.service';
import { IStore } from 'app/shared/state/store.interface';
import { Users } from 'app/shared/state/users.actions';
import { IUsersTable } from 'app/shared/state/users.interface';
import { getUsers } from 'app/shared/state/users.selectors';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  loginForm: FormGroup;
  users$: Observable<IUsersTable>;
  matcher = new FormErrorStateMatcher();

  constructor(
    private store$: Store<IStore>,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.users$ = this.store$.select(getUsers);

    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });

    this.users$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(users => {
          if (users.isConnecting || users.connectedUser) {
            this.loginForm.disable();
            this.loginForm.disable();
          } else {
            this.loginForm.enable();
            this.loginForm.enable();
          }
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  onSubmit(value: IUserLogin) {
    this.store$.dispatch(
      new Users.Connect({
        user: value,
        previousUrl: this.route.snapshot.queryParamMap.get('previousUrl'),
      })
    );
  }
}
