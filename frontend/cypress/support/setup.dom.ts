/**
 * Copyright (C) 2018 Linagora
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
const bs = `app-setup`;

export const SETUP_DOM = {
  inputs: {
    token: `${bs} input[formcontrolname=token]`,
    username: `${bs} input[formcontrolname=username]`,
    password: `${bs} input[formcontrolname=password]`,
    name: `${bs} input[formcontrolname=name]`,
  },
  buttons: {
    submit: `${bs} button`,
  },
  messages: {
    error: {
      setupFailed: `${bs} .form-error`,
    },
  },
  icons: {
    togglePwd: `${bs} .icon-toggle-pwd`,
  },
  formFields: {
    tokenFormField: `${bs} .token-form-field`,
    usernameFormField: `${bs} .username-form-field`,
    pwdFormField: `${bs} .pwd-form-field`,
    nameFormField: `${bs} .name-form-field`,
  },
};
