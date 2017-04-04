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

import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MdInputContainer } from '@angular/material';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { IStore } from './../../shared/interfaces/store.interface';
import { Users } from './../../shared/state/users.reducer';
import { IUsersTable } from './../../shared/interfaces/users.interface';
import { isLargeScreen } from 'app/shared/state/ui.selectors';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {
  private onDestroy$ = new Subject<void>();

  @ViewChild('usernameInput') usernameInput: MdInputContainer;

  public loginForm: FormGroup;
  private users$: Observable<IUsersTable>;
  public users: IUsersTable;

  constructor(
    private store$: Store<IStore>,
    private route: ActivatedRoute,
    private fb: FormBuilder) { }

  ngOnInit() {
    this.users$ = this.store$.select(state => state.users);

    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this
      .users$
      .distinctUntilChanged((p, n) =>
        p.isConnected === n.isConnected &&
        p.isConnecting === n.isConnecting &&
        p.connectionFailed === n.connectionFailed
      )
      .takeUntil(this.onDestroy$)
      .do(users => {
        this.users = users;

        if (users.isConnecting || users.isConnected) {
          this.loginForm.disable();
          this.loginForm.disable();
        } else {
          this.loginForm.enable();
          this.loginForm.enable();
        }
      })
      .subscribe();
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
      .do(_ => this.usernameInput._focusInput())
      .subscribe();
  }

  onSubmit({ value }) {
    this.store$.dispatch({
      type: Users.CONNECT_USER,
      payload: { user: value, previousUrl: this.route.snapshot.queryParamMap.get('previousUrl') }
    });
  }
}
