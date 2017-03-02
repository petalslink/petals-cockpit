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
import { IUser } from './../interfaces/user.interface';
import { environment } from './../../../environments/environment';
import * as helper from './../helpers/mock.helper';

@Injectable()
export class UsersMockService extends UsersService {
  private userIsConnected: boolean = environment.alreadyConnected;
  private adminUser: IUser;

  constructor() {
    super();
    this.adminUser = {
      id: 'admin',
      name: 'Administrator',
      username: 'admin',
      lastWorkspace: '',
      password: ''
    };
  }

  connectUser(user: IUser) {
    if (user.username === 'admin' && user.password === 'admin') {
      this.userIsConnected = true;
      return helper.responseBody(user);
    }

    return helper.response(401);
  }

  disconnectUser() {
    this.userIsConnected = false;

    return helper.response(204);
  }

  getUserInformations() {
    if (this.userIsConnected) {
      return helper.responseBody(this.adminUser);
    }

    return helper.response(401);
  }
}
