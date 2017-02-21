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

import { FormGroup } from '@angular/forms';

export const validationMessages = {
  'ip': {
    'required': 'Required !',
    'isIp': 'Invalid IP format'
  },
  'port': {
    'required': 'Required !',
    'isPort': 'Invalid port format. Should be 0 <= port <= 65535'
  },
  'username': {
    'required': 'Required !'
  },
  'password': {
    'required': 'Required !'
  },
  'passphrase': {
    'required': 'Required !'
  }
};

export function getFormErrors(form: FormGroup, formFields: { [key: string]: string }, data?: any): any {
  const formFieldsTmp = { ...formFields };

  for (const field in formFieldsTmp) {
    if (formFieldsTmp.hasOwnProperty(field)) {
      formFieldsTmp[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = validationMessages[field];
        for (const key in control.errors) {
          if (control.errors.hasOwnProperty(key)) {
            formFieldsTmp[field] += messages[key] + ' ';
            break;
          }
        }
      }
    }
  }

  return formFieldsTmp;
}

export function enableAllFormFields(form: FormGroup) {
  _enableOrDisableAllFormFields(form, true);
}

export function disableAllFormFields(form: FormGroup) {
  _enableOrDisableAllFormFields(form, false);
}

export function _enableOrDisableAllFormFields(form: FormGroup, enable: boolean) {
  for (const key in form.controls) {
    if (form.controls.hasOwnProperty(key)) {
      if (enable) {
        form.controls[key].enable();
      } else {
        form.controls[key].disable();
      }
    }
  }
}
