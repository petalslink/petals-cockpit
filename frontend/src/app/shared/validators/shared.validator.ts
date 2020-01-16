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

import { AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';

export class SharedValidator {
  /**
   * async validator to determine whether a string
   * is contained in an Observable<string[]>
   */
  static isStringInObsArrayValidator(arr$: Observable<string[]>) {
    return (str: AbstractControl) =>
      arr$.pipe(
        first(),
        map(
          arr =>
            arr.includes(str.value)
              ? // return null will mark the validator as valid
                null
              : // returning an object (containing the error) will mark the validator as not valid
                { isIncluded: false }
        )
      );
  }

  /**
   * sync validator to determine whether an object
   * contains a given key
   */
  static isKeyPresentInObject(getObj: () => Object) {
    return (control: AbstractControl) => {
      const value = (<string>control.value || '').trim().toLowerCase();
      const obj = getObj();

      return obj && obj.hasOwnProperty(value)
        ? {
            isKeyPresentInObject: true,
          }
        : null;
    };
  }
}
