/**
 * Copyright (C) 2017-2018 Linagora
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

import {
  ICurrentUserBackend,
  IUserBackend,
  IUserNew,
} from 'app/shared/services/users.service';
import { workspacesService } from 'mocks/workspaces-mock';

export class BackendUser {
  private static cpt = 0;
  private static readonly users = new Map<string, BackendUser>();

  public readonly id: string;
  public password: string;
  public name: string;
  public lastWorkspace?: string;
  public isAdmin: boolean;

  static get(id: string) {
    return this.users.get(id);
  }

  static getAll() {
    return Array.from(this.users.values());
  }

  static delete(id: string) {
    workspacesService.getWorkspaces(id).forEach(w => w.deleteUser(id));
    return this.users.delete(id);
  }

  static create(user: Partial<IUserNew>): BackendUser {
    if (this.users.has(user.username)) {
      return null;
    } else {
      const u = new BackendUser(user.username, user.name, user.password);
      BackendUser.users.set(user.username, u);
      return u;
    }
  }

  private constructor(username?: string, name?: string, password?: string) {
    this.id = username ? username : `idUser${BackendUser.cpt++}`;
    this.password = password ? password : this.id;
    this.name = name ? name : username;
    this.isAdmin = false;
  }

  getDetails(): ICurrentUserBackend {
    return {
      id: this.id,
      name: this.name,
      lastWorkspace: this.lastWorkspace,
      isAdmin: this.isAdmin,
    };
  }

  toObj(): { [id: string]: IUserBackend } {
    return {
      [this.id]: {
        id: this.id,
        name: this.name,
      },
    };
  }
}

const admin = BackendUser.create({ username: 'admin', name: 'Administrator' });
admin.lastWorkspace = 'idWks0';
admin.isAdmin = true;
BackendUser.create({ username: 'bescudie', name: 'Bertrand ESCUDIE' });
BackendUser.create({ username: 'mrobert', name: 'Maxime ROBERT' });
BackendUser.create({ username: 'cchevalier', name: 'Christophe CHEVALIER' });
BackendUser.create({ username: 'vnoel', name: 'Victor NOEL' });
BackendUser.create({ username: 'cdeneux', name: 'Christophe DENEUX' });
