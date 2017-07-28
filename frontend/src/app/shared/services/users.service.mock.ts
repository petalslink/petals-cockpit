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
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import * as helper from 'app/shared/helpers/mock.helper';
import { ICurrentUser } from 'app/shared/state/users.interface';
import { environment } from 'environments/environment';
import { CORRECT_SETUP_TOKEN, GONE_SETUP_TOKEN } from 'mocks/backend-mock';
import { BackendUser } from 'mocks/users-mock';
import {
  ICurrentUserBackend,
  IUserBackend,
  IUserLogin,
  IUserNew,
  IUserSetup,
  UsersService,
} from './users.service';

@Injectable()
export class UsersServiceMock extends UsersService {
  private currentUser: ICurrentUser = null;

  constructor() {
    super();
    if (environment.mock.alreadyConnected) {
      this.connectUser({ username: 'admin', password: 'admin' });
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  connectUser(user: IUserLogin) {
    const u = BackendUser.get(user.username);

    const valid = u && u.password === user.password;
    if (valid) {
      this.currentUser = u.getDetails();
    }

    return (valid
      ? helper.responseBody(this.currentUser)
      : helper.response(401)).map(res => res.json() as ICurrentUserBackend);
  }

  disconnectUser() {
    const connected = this.currentUser !== null;
    this.currentUser = null;

    return connected ? helper.response(204) : helper.response(401);
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

  private responseAdmin(res: Observable<Response>) {
    return this.currentUser
      ? this.currentUser.isAdmin ? res : helper.response(403)
      : helper.response(401);
  }

  getAll() {
    return this.responseAdmin(
      helper.responseBody(
        BackendUser.getAll().map(u => ({ id: u.id, name: u.name }))
      )
    ).map(res => res.json() as IUserBackend[]);
  }

  getOne(id: string) {
    const u = BackendUser.get(id);
    return this.responseAdmin(
      u ? helper.responseBody({ id: u.id, name: u.name }) : helper.response(404)
    ).map(res => res.json() as IUserBackend);
  }

  add(user: IUserNew) {
    const added = BackendUser.create(user);
    return this.responseAdmin(
      added ? helper.response(204) : helper.response(409)
    );
  }

  delete(id: string) {
    const deleted = BackendUser.delete(id);
    return this.responseAdmin(
      deleted ? helper.response(204) : helper.response(409)
    );
  }

  modify(id: string, props: { name?: string; password?: string }) {
    const user = BackendUser.get(id);
    if (user) {
      user.name = props.name || user.name;
      user.password = props.password || user.password;
    }
    return this.responseAdmin(
      user ? helper.response(204) : helper.response(409)
    );
  }
}
