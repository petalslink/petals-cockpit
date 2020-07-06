/**
 * Copyright (C) 2017-2020 Linagora
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
import { Observable, of } from 'rxjs';

import { environment } from '@env/environment';
import {
  BAD_SETUP_USER,
  CORRECT_SETUP_TOKEN,
  GONE_SETUP_TOKEN,
} from '@mocks/backend-mock';
import { BackendUser } from '@mocks/users-mock';
import * as helper from '@shared/helpers/mock.helper';
import { IWorkspaceUserPermissionsBackend } from '@shared/services/workspaces.service';
import { ICurrentUser } from '@shared/state/users.interface';
import {
  ICurrentUserBackend,
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

    return valid
      ? helper.responseBody<ICurrentUserBackend>(this.currentUser)
      : helper.response<ICurrentUserBackend>(401);
  }

  disconnectUser() {
    const connected = this.currentUser !== null;
    this.currentUser = null;

    return connected ? helper.response(204) : helper.response(401);
  }

  getCurrentUserInformations() {
    return this.currentUser
      ? helper.responseBody<ICurrentUserBackend>(this.currentUser)
      : helper.response<ICurrentUserBackend>(401);
  }

  setupUser(value: IUserSetup) {
    if (value.token === GONE_SETUP_TOKEN) {
      return helper.errorBackend('Petals Cockpit is already setup', 404);
    }

    if (value.token !== CORRECT_SETUP_TOKEN) {
      return helper.errorBackend('Invalid token', 403);
    }

    if (value.username === BAD_SETUP_USER) {
      return helper.errorBackend('Conflict', 409);
    }

    return helper.response(204);
  }

  private responseAdmin<T>(res: Observable<T>) {
    return this.currentUser
      ? this.currentUser.isAdmin ? res : helper.response(403)
      : helper.response(401);
  }

  getLdapUsers(search: string) {
    const usersIdAndName = BackendUser.getFilteredLdapUsers(
      search.toLowerCase()
    );

    return this.responseAdmin(helper.responseBody(usersIdAndName));
  }

  getAll() {
    const usersIdAndName = BackendUser.getAll().map(u => ({
      id: u.id,
      name: u.name,
      isAdmin: u.isAdmin,
    }));

    return this.responseAdmin(helper.responseBody(usersIdAndName));
  }

  getOne(id: string) {
    const u = BackendUser.get(id);

    return this.responseAdmin(
      u
        ? helper.responseBody({ id: u.id, name: u.name, isAdmin: u.isAdmin })
        : helper.response(404)
    );
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

  modify(
    id: string,
    props: { name?: string; password?: string; isAdmin?: boolean }
  ) {
    const user = BackendUser.get(id);

    if (user) {
      user.name = props.name || user.name;
      user.password = props.password || user.password;
      user.isAdmin = props.isAdmin;
    }

    return this.responseAdmin(
      user ? helper.response(204) : helper.response(409)
    );
  }

  getPermissions(userId: string) {
    const perms: {
      permissions: { [wksId: string]: IWorkspaceUserPermissionsBackend };
    } = { permissions: {} };
    return of(perms);
  }
}
