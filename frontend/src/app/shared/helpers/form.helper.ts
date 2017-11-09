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

import {
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

interface IValidationMessages {
  ip?: {
    required: string;
    isIp: string;
  };
  port?: {
    required: string;
    isPort: string;
  };
  username?: {
    required: string;
  };
  name?: {
    required: string;
  };
  password?: {
    required: string;
  };
  passphrase?: {
    required: string;
  };
}

const validationMessages: IValidationMessages = {
  ip: {
    required: 'Required!',
    isIp: 'Invalid IP format',
  },
  port: {
    required: 'Required!',
    isPort: 'Invalid port format: expected 0 <= port <= 65535',
  },
  username: {
    required: 'Required!',
  },
  name: {
    required: 'Required!',
  },
  password: {
    required: 'Required!',
  },
  passphrase: {
    required: 'Required!',
  },
};

export function getFormErrors(
  form: FormGroup,
  formFields: { [key in keyof IValidationMessages]: string }
): any {
  const formFieldsCopy = { ...formFields };

  for (const field in formFieldsCopy) {
    if (formFieldsCopy.hasOwnProperty(field)) {
      const validationMessageField = <keyof IValidationMessages>field;

      formFieldsCopy[validationMessageField] = '';

      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = validationMessages[validationMessageField];

        for (const key in control.errors) {
          if (control.errors.hasOwnProperty(key)) {
            formFieldsCopy[validationMessageField] +=
              (messages as any)[key] + ' ';
            break;
          }
        }
      }
    }
  }

  return formFieldsCopy;
}

export function enableAllFormFields(form: FormGroup) {
  _enableOrDisableAllFormFields(form, true);
}

export function disableAllFormFields(form: FormGroup) {
  _enableOrDisableAllFormFields(form, false);
}

export function _enableOrDisableAllFormFields(
  form: FormGroup,
  enable: boolean
) {
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

export class FormErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl,
    formToCheck: FormGroupDirective | NgForm
  ): boolean {
    const isSubmitted = formToCheck && formToCheck.submitted;
    return !!(control.invalid && (control.dirty || isSubmitted));
  }
}
