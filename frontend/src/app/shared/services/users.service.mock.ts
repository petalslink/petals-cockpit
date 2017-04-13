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

import { UsersService } from './users.service';
import { IUserLogin, ICurrentUser } from './../interfaces/user.interface';
import { environment } from './../../../environments/environment';
import * as helper from './../helpers/mock.helper';
import { users } from './../../../mocks/workspaces-mock';

@Injectable()
export class UsersMockService extends UsersService {

  private static users = {
    admin: {
      ...users.admin,
      lastWorkspace: 'idWks0'
    },
    vnoel: {
      ...users.vnoel,
      lastWorkspace: ''
    },
    mrobert: {
      ...users.mrobert,
      lastWorkspace: ''
    },
    bescudie: {
      ...users.bescudie,
      lastWorkspace: ''
    }
  };

  private currentUser: ICurrentUser = null;

  constructor() {
    super();
    if (environment.alreadyConnected) {
      this.currentUser = UsersMockService.users.admin;
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  connectUser(user: IUserLogin) {
    if (UsersMockService.users[user.username] && user.username === user.password) {
      this.currentUser = UsersMockService.users[user.username];
      return helper.responseBody(this.currentUser);
    }

    return helper.response(401);
  }

  disconnectUser() {
    this.currentUser = null;

    return helper.response(204);
  }

  getUserInformations() {
    if (this.currentUser) {
      return helper.responseBody(this.currentUser);
    }

    return helper.response(401);
  }
}
