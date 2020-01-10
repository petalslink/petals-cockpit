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

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import * as helper from '@shared/helpers/mock.helper';
import { ILdapStatus, LdapServiceImpl } from './ldap.service';

import { environment as env } from '@env/environment';

@Injectable()
export class LdapServiceMock extends LdapServiceImpl {
  private status: ILdapStatus = { isLdapMode: env.mock.ldapMode };

  constructor(http: HttpClient) {
    super(http);
  }

  getLdapStatus() {
    return helper.responseBody<ILdapStatus>(this.status);
  }
}
