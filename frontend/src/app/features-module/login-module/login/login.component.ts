/**
 * Copyright (C) 2016 Linagora
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

// angular modules
import { Component, ChangeDetectionStrategy, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';

// rxjs
import { Subscription } from 'rxjs';

// angular material
import { MdInput } from '@angular/material';

// ngrx
import { Store } from '@ngrx/store';

// our actions
import { UserActions } from '../../../shared-module/reducers/user.actions';

// our interfaces
import { IStore } from '../../../shared-module/interfaces/store.interface';
import { IUser, IUserRecord } from '../../../shared-module/interfaces/user.interface';

@Component({
  selector: 'app-login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnDestroy, AfterViewInit {
  public user: IUser;
  private userSub: Subscription;

  // TODO: Review needed, isn't there a directive for that ?
  @ViewChild('nameInput') nameInput: MdInput;

  constructor(private store$: Store<IStore>) {
    this.userSub =
      store$.select('user')
        .map((userR: IUserRecord) => userR.toJS())
        .subscribe((user: IUser) => this.user = user);
  }

  ngAfterViewInit() {
    this.nameInput.focus();
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
  }

  connectUser(user: IUser) {
    this.store$.dispatch({ type: UserActions.USR_IS_CONNECTING, payload: user });
  }
}
