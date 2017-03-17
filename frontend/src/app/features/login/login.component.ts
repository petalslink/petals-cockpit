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
import { Subscription } from 'rxjs/Subscription';

import { IStore } from './../../shared/interfaces/store.interface';
import { Users } from './../../shared/state/users.reducer';
import { IUsersTable } from './../../shared/interfaces/users.interface';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('usernameInput') usernameInput: MdInputContainer;

  public loginForm: FormGroup;
  private users$: Observable<IUsersTable>;
  private usersSub: Subscription;
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

    this.usersSub = this
      .users$
      .distinctUntilChanged((p, n) =>
        p.isConnected === n.isConnected &&
        p.isConnecting === n.isConnecting &&
        p.connectionFailed === n.connectionFailed
      )
      .map(users => {
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
    this.usersSub.unsubscribe();
  }

  ngAfterViewInit() {
    this.usernameInput._focusInput();
  }

  onSubmit({ value }) {
    this.store$.dispatch({
      type: Users.CONNECT_USER,
      payload: { user: value, previousUrl: this.route.snapshot.queryParams.previousUrl }
    });
  }
}
