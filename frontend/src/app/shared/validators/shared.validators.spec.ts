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

import { async } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';

import { SharedValidator } from 'app/shared/validators/shared.validator';
import { AbstractControl } from '@angular/forms';

describe(`SharedValidator`, () => {
  describe(`isStringInObsArrayValidator`, () => {
    it(
      `should return null if an Observable containing an array of strings contains a given string`,
      async(() => {
        const arr$ = Observable.of(['string 1', 'string 2', 'string 3']);

        const fakeAbstractControl = {
          value: 'string 2',
        } as AbstractControl;

        SharedValidator.isStringInObsArrayValidator(arr$)(fakeAbstractControl)
          .do(x => expect(x).toBeNull())
          .subscribe();
      })
    );

    it(
      `should return an object containing isIncluded: false if the Observable containing the array of strings does not contains a given string`,
      async(() => {
        const arr$ = Observable.of(['string 1', 'string 2', 'string 3']);

        const fakeAbstractControl1 = {
          value: 'some random string',
        } as AbstractControl;

        SharedValidator.isStringInObsArrayValidator(arr$)(fakeAbstractControl1)
          .do(x => expect(x).toEqual({ isIncluded: false }))
          .subscribe();

        // --------------------------------------

        const arr2$ = Observable.of(['string 1', 'string 2', 'string 3']);

        // even if the string is partially correct it should return the object
        const fakeAbstractControl2 = {
          value: 'string',
        } as AbstractControl;

        SharedValidator.isStringInObsArrayValidator(arr2$)(fakeAbstractControl2)
          .do(x => expect(x).toEqual({ isIncluded: false }))
          .subscribe();
      })
    );

    it(
      `should only use the first emission from the observable and close right after`,
      async(() => {
        const arr$ = Observable.of(
          ['string 1', 'string 2', 'string 3'],
          // if we're looking for 'string 4', as it's in the second emission it should return the object (which means not found)
          ['string 4', 'string 5']
        );

        const fakeAbstractControl = {
          value: 'string 4',
        } as AbstractControl;

        let emitCpt = 0;

        SharedValidator.isStringInObsArrayValidator(arr$)(fakeAbstractControl)
          .do(x => {
            expect(x).toEqual({ isIncluded: false });
            emitCpt++;
          })
          .finally(() => {
            expect(emitCpt).toEqual(1);
          })
          .subscribe();
      })
    );
  });
});
