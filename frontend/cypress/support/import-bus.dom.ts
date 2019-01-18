/**
 * Copyright (C) 2018-2019 Linagora
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

// base selector
const bs = `app-petals-bus-in-progress-view`;

export const IMPORT_BUS_DOM = {
  inputs: {
    ip: `${bs} input[formcontrolname="ip"]`,
    port: `${bs} input[formcontrolname="port"]`,
    username: `${bs} input[formcontrolname="username"]`,
    password: `${bs} input[formcontrolname="password"]`,
    passphrase: `${bs} input[formcontrolname="passphrase"]`,
  },
  buttons: {
    clear: `${bs} .btn-clear-form`,
    discard: `${bs} .btn-discard-form`,
    submit: `${bs} .btn-import-form`,
  },
};
