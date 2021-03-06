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

import { workspacesService } from '@mocks/workspaces-mock';
import {
  ICurrentUserBackend,
  IUserBackend,
  IUserNew,
} from '@shared/services/users.service';
import { IUserLDAP } from '@shared/state/users.interface';

export class BackendUser {
  private static cpt = 0;
  private static readonly users = new Map<string, BackendUser>();
  private static readonly usersLdap: IUserLDAP[] = [
    { username: 'alagane', name: 'Alexandre LAGANE' },
    { username: 'psouquet', name: 'Pierre SOUQUET' },
    { username: 'vzurczak', name: 'Vincent ZURCZAK' },
    { username: 'sgarcia', name: 'Sébastien GARCIA' },
    { username: 'jcabannes', name: 'Jordy CABANNES' },
    { username: 'avigier', name: 'Albin VIGIER' },
    { username: 'yhoupert', name: 'Yoann HOUPERT' },
  ];

  public readonly id: string;
  public password: string;
  public name: string;
  public lastWorkspace?: string;
  public isAdmin: boolean;
  public isFromLdap?: boolean;

  static get(id: string) {
    return this.users.get(id);
  }

  static getAll() {
    return Array.from(this.users.values());
  }

  static getFilteredLdapUsers(search: string) {
    if (search.length) {
      const lowerSearch = search.toLowerCase();
      return this.usersLdap.filter(
        u =>
          u.username.toLowerCase().includes(lowerSearch) ||
          u.name.toLowerCase().includes(lowerSearch)
      );
    } else {
      return [];
    }
  }

  static delete(id: string) {
    workspacesService.getWorkspaces(id).forEach(w => w.deleteUser(id));
    return this.users.delete(id);
  }

  static create(user: Partial<IUserNew>): BackendUser {
    if (this.users.has(user.username)) {
      return null;
    } else {
      const u = new BackendUser(
        user.username,
        user.name,
        user.password,
        user.isAdmin
      );
      BackendUser.users.set(user.username, u);
      return u;
    }
  }

  private constructor(
    username?: string,
    name?: string,
    password?: string,
    isAdmin?: boolean
  ) {
    this.id = username ? username : `idUser${BackendUser.cpt++}`;
    this.password = password ? password : this.id;
    this.name = name ? name : username;
    this.isAdmin = isAdmin ? isAdmin : false;
    this.isFromLdap = false;
  }

  getDetails(): ICurrentUserBackend {
    return {
      id: this.id,
      name: this.name,
      lastWorkspace: this.lastWorkspace,
      isAdmin: this.isAdmin,
      isFromLdap: this.isFromLdap,
    };
  }

  toObj(): { [id: string]: IUserBackend } {
    return {
      [this.id]: {
        id: this.id,
        name: this.name,
        isAdmin: this.isAdmin,
      },
    };
  }
}

const admin = BackendUser.create({ username: 'admin', name: 'Administrator' });
admin.lastWorkspace = 'idWks0';
admin.isAdmin = true;
admin.isFromLdap = false;

const adminLdap = BackendUser.create({
  username: 'adminldap',
  name: 'Administrator LDAP',
});
adminLdap.lastWorkspace = 'idWks1';
adminLdap.isAdmin = true;
adminLdap.isFromLdap = true;

BackendUser.create({
  username: 'bescudie',
  name: 'Bertrand ESCUDIE',
});

BackendUser.create({
  username: 'mrobert',
  name: 'Maxime ROBERT',
});

BackendUser.create({
  username: 'cchevalier',
  name: 'Christophe CHEVALIER',
});

BackendUser.create({ username: 'vnoel', name: 'Victor NOEL' });

BackendUser.create({
  username: 'cdeneux',
  name: 'Christophe DENEUX',
});
