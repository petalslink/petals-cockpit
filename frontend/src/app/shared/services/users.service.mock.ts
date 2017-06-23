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

import { Injectable } from '@angular/core';

import {
  UsersService,
  IUserLogin,
  IUserSetup,
  ICurrentUserBackend,
} from './users.service';
import { ICurrentUser } from '../state/users.interface';
import { environment } from './../../../environments/environment';
import * as helper from './../helpers/mock.helper';
import {
  users,
  CORRECT_SETUP_TOKEN,
  GONE_SETUP_TOKEN,
} from './../../../mocks/backend-mock';

@Injectable()
export class UsersServiceMock extends UsersService {
  private static users: { [username: string]: ICurrentUser } = {
    admin: {
      ...users.admin,
      lastWorkspace: 'idWks0',
      isAdmin: true,
    },
    vnoel: {
      ...users.vnoel,
      lastWorkspace: '',
      isAdmin: false,
    },
    mrobert: {
      ...users.mrobert,
      lastWorkspace: '',
      isAdmin: false,
    },
    bescudie: {
      ...users.bescudie,
      lastWorkspace: '',
      isAdmin: false,
    },
  };

  private currentUser: ICurrentUser = null;

  constructor() {
    super();
    if (environment.mock.alreadyConnected) {
      this.currentUser = UsersServiceMock.users.admin;
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  connectUser(user: IUserLogin) {
    let ok = false;
    if (
      UsersServiceMock.users[user.username] &&
      user.username === user.password
    ) {
      this.currentUser = UsersServiceMock.users[user.username];
      ok = true;
    }

    return (ok
      ? helper.responseBody(this.currentUser)
      : helper.response(401)).map(res => res.json() as ICurrentUserBackend);
  }

  disconnectUser() {
    this.currentUser = null;

    return helper.response(204);
  }

  getCurrentUserInformations() {
    return (this.currentUser
      ? helper.responseBody(this.currentUser)
      : helper.response(401)).map(res => res.json() as ICurrentUserBackend);
  }

  setupUser(value: IUserSetup) {
    if (value.token === CORRECT_SETUP_TOKEN) {
      return helper.response(204);
    }

    if (value.token === GONE_SETUP_TOKEN) {
      return helper.errorBackend('Petals Cockpit is already setup', 404);
    }

    return helper.errorBackend('Invalid token', 403);
  }
}
