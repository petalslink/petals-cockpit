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
    isPortOrNull: string;
  };
  username?: {
    required: string;
    existingUserWithSimilarUsername: string;
    isInvalidUsername: string;
    isInvalidUsernameFirstChar: string;
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
  userSearchCtrl?: {
    required: string;
  };
  token?: {
    required: string;
  };
  workspaceName?: {
    required: string;
    maxLength: string;
    existingWorkspaceWithSimilarName: string;
  };
  shortDescription?: {
    maxLength: string;
  };
}

const validationMessages: IValidationMessages = {
  ip: {
    required: 'Required!',
    isIp: 'Invalid IP format',
  },
  port: {
    required: 'Required!',
    isPort: 'Must be between 0 and 65535',
    isPortOrNull: 'Must be between 0 and 65535',
  },
  username: {
    required: 'Required!',
    existingUserWithSimilarUsername: 'User already exists!',
    isInvalidUsername:
      'Can only contain alphanumeric characters as well as dots, dashes and underscores',
    isInvalidUsernameFirstChar: 'Must start with an alphanumeric character',
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
  userSearchCtrl: {
    required: 'Required!',
  },
  token: {
    required: 'Required!',
  },
  workspaceName: {
    required: 'Required!',
    maxLength: 'Max 100 characters!',
    existingWorkspaceWithSimilarName: 'Existing workspace with similar name',
  },
  shortDescription: {
    maxLength: 'Max 200 characters!',
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

export class FormErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl,
    formToCheck: FormGroupDirective | NgForm
  ): boolean {
    const isSubmitted = formToCheck && formToCheck.submitted;
    return !!(control.invalid && (control.dirty || isSubmitted));
  }
}
