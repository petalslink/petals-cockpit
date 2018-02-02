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

import { async } from '@angular/core/testing';
import { cold } from 'jasmine-marbles';
import { from } from 'rxjs/observable/from';
import { tap } from 'rxjs/operators';

import { deletable } from 'app/shared/operators/deletable.operator';

describe(`Deletable operator`, () => {
  it(
    `should wrap the initial value and set it as not deleted`,
    async(() => {
      const obs$ = cold('a|', { a: 'a value' });

      expect(obs$.pipe(deletable)).toBeObservable(
        cold('a|', {
          a: {
            isDeleted: false,
            value: 'a value',
          },
        })
      );
    })
  );

  it(
    `should return undefined as long as the value is null/undefined from the beginning`,
    async(() => {
      const obs$ = cold('abcd|', {
        a: null,
        b: undefined,
        c: null,
        d: 'a value',
      });

      expect(obs$.pipe(deletable)).toBeObservable(
        cold('a--b|', {
          a: undefined,
          b: {
            isDeleted: false,
            value: 'a value',
          },
        })
      );
    })
  );

  it(
    `should set isDeleted to true if the value is null
    and return the latest non null/undefined value available`,
    async(() => {
      const obs$ = cold('ab|', { a: 'a value', b: null });

      expect(obs$.pipe(deletable)).toBeObservable(
        cold('ab|', {
          a: {
            isDeleted: false,
            value: 'a value',
          },
          b: {
            isDeleted: true,
            value: 'a value',
          },
        })
      );
    })
  );

  it(
    `should set isDeleted to true if the value is undefined
    and return the latest non null/undefined value available`,
    async(() => {
      const obs$ = cold('ab|', { a: 'a value', b: undefined });

      expect(obs$.pipe(deletable)).toBeObservable(
        cold('ab|', {
          a: {
            isDeleted: false,
            value: 'a value',
          },
          b: {
            isDeleted: true,
            value: 'a value',
          },
        })
      );
    })
  );

  it(
    `should continue to send non null/undefined values even after one value deleted value`,
    async(() => {
      const obs$ = cold('abc|', { a: 'a value', b: null, c: 'another value' });

      expect(obs$.pipe(deletable)).toBeObservable(
        cold('abc|', {
          a: {
            isDeleted: false,
            value: 'a value',
          },
          b: {
            isDeleted: true,
            value: 'a value',
          },
          c: {
            isDeleted: false,
            value: 'another value',
          },
        })
      );
    })
  );

  it(
    `should compare values by reference`,
    async(() => {
      const obj1 = { a: 1 };
      const obj2 = { b: 2 };
      const obs$ = from([obj1, obj1, obj2, obj2]).pipe(deletable);

      let cpt = 1;
      obs$
        .pipe(
          tap(obs => {
            switch (cpt) {
              case 1:
                expect(obs.isDeleted).toBe(false);
                expect(obs.value).toBe(obj1);
                break;

              case 2:
                expect(obs.isDeleted).toBe(false);
                expect(obs.value).toBe(obj2);
                break;

              case 3:
                expect('this').toBe('never called');
                break;
            }

            cpt++;
          })
        )
        .subscribe();
    })
  );
});
