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

import { deletable } from 'app/shared/operators/deletable.operator';

describe(`Deletable operator`, () => {
  it(
    `should wrap the initial value and set it as not deleted`,
    async(() => {
      const obs$ = Observable.of({ a: 1, b: 2 }).let(deletable);

      obs$
        .do(obs =>
          expect(obs).toEqual({
            isDeleted: false,
            value: { a: 1, b: 2 },
          })
        )
        .subscribe();
    })
  );

  it(
    `
    should set isDeleted to true if the value is null or undefined
    and return the latest non null/undefined value available`,
    async(() => {
      const obs$ = Observable.from([{ a: 1, b: 2 }, null]).let(deletable);

      obs$
        .last()
        .do(obs =>
          expect(obs).toEqual({
            isDeleted: true,
            value: { a: 1, b: 2 },
          })
        )
        .subscribe();
    })
  );

  it(
    `should continue to send non null/undefined values even after one value deleted value`,
    async(() => {
      const obs$ = Observable.from([{ a: 1, b: 2 }, null, { c: 3, d: 4 }]).let(
        deletable
      );

      obs$
        .last()
        .do(obs =>
          expect(obs).toEqual({
            isDeleted: false,
            value: { c: 3, d: 4 },
          })
        )
        .subscribe();
    })
  );

  describe(`
    shouldn't emit values again if it's the same than previous value,
    except is isDeleted changes`, () => {
    it(
      `for primitive types`,
      async(() => {
        const obs$ = Observable.from([1, 2, 3, 3, 4, true, true, false]).let(
          deletable
        );

        let cpt = 1;
        obs$
          .do(obs => {
            switch (cpt) {
              case 1:
                expect(obs).toEqual({ isDeleted: false, value: 1 });
                break;

              case 2:
                expect(obs).toEqual({ isDeleted: false, value: 2 });
                break;

              case 3:
                expect(obs).toEqual({ isDeleted: false, value: 3 });
                break;

              case 4:
                expect(obs).toEqual({ isDeleted: false, value: 4 });
                break;

              case 5:
                expect(obs).toEqual({ isDeleted: false, value: true });
                break;

              case 6:
                expect(obs).toEqual({ isDeleted: false, value: false });
                break;
            }

            cpt++;
          })
          .subscribe();
      })
    );

    it(
      `for objects (by reference)`,
      async(() => {
        const obj1 = { a: 1 };
        const obj2 = { b: 2 };
        const obs$ = Observable.from([obj1, obj1, obj2, obj2]).let(deletable);

        let cpt = 1;
        obs$
          .do(obs => {
            switch (cpt) {
              case 1:
                expect(obs).toEqual({ isDeleted: false, value: obj1 });
                break;

              case 2:
                expect(obs).toEqual({ isDeleted: false, value: obj2 });
                break;

              case 3:
                expect('this').toBe('never called');
                break;
            }

            cpt++;
          })
          .subscribe();
      })
    );
  });
});
