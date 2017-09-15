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

import { HttpErrorResponse } from '@angular/common/http';

import { ComponentState } from 'app/shared/services/components.service';
import { EServiceAssemblyState } from 'app/shared/services/service-assemblies.service';
import { ESharedLibraryState } from 'app/shared/services/shared-libraries.service';
import { environment } from 'environments/environment';

const matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

export function assert(
  condition: boolean | (() => boolean),
  message = 'Assertion error'
): void {
  if (
    environment.strictCoherence &&
    !(typeof condition === 'function' ? condition() : condition)
  ) {
    throw new Error(message);
  }
}

export function escapeStringRegexp(str: string) {
  return str.replace(matchOperatorsRe, '\\$&');
}

/**
 * useful to force type inference to take an array as a tuple!
 */
export function tuple<T extends [void] | {}>(t: T): T {
  return t;
}

export function tupleEquals<T extends [void]>(ps: T, ns: T): boolean {
  return arrayEquals(ps, ns);
}

export function arrayEquals<T>(ps: T[], ns: T[]): boolean {
  return ps.length === ns.length && ps.every((p, i) => p === ns[i]);
}

export function isNot(e: object): (object: any) => boolean {
  return e2 => e !== e2;
}

export const stateToLedColor = (
  state: ComponentState | EServiceAssemblyState | ESharedLibraryState
) => {
  switch (state) {
    case 'Started': {
      return 'green';
    }
    case 'Loaded': {
      return 'grey';
    }
    case 'Shutdown': {
      return 'red';
    }
    case 'Stopped': {
      return 'yellow';
    }
    case 'Unknown': {
      return 'black';
    }
    case 'Unloaded': {
      return 'white';
    }
  }
};

/**
 * as our backend sends an object instead of a simple string within
 * the `err.error` object, this function let us know which kind of
 * error it is
 */
function isBackendError(
  value: any
): value is { code: number; message: string } {
  return typeof value.code === 'number' && typeof value.message === 'string';
}

export function getErrorMessage(err: HttpErrorResponse) {
  if (isBackendError(err.error)) {
    return err.error.message;
  } else {
    return `${err.status}: ${err.statusText}`;
  }
}
