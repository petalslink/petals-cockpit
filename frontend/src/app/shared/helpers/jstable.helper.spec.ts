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
  emptyJsTable,
  mergeInto,
  mergeOnly,
  putAll,
  putById,
  removeById,
  toJsTable,
  updateById,
} from 'app/shared/helpers/jstable.helper';
import { environment } from 'environments/environment';

describe('helpers to manipulate tables', () => {
  interface T {
    v: string;
    i: number;
  }
  function init(): T {
    return { v: '', i: 0 };
  }

  afterEach(() => {
    environment.strictCoherence = true;
  });

  describe('to table', () => {
    it('should produce an empty table from an empty object', () => {
      expect(toJsTable({})).toEqual(emptyJsTable());
    });

    it('should produce a table from a non-empty object', () => {
      expect(
        toJsTable({
          key1: { v: 'value' },
          key2: { v: 'value2' },
          key3: { v: 'value' },
        })
      ).toEqual({
        byId: {
          key1: { id: 'key1', v: 'value' },
          key2: { id: 'key2', v: 'value2' },
          key3: { id: 'key3', v: 'value' },
        },
        allIds: ['key1', 'key2', 'key3'],
      });
    });
  });

  describe('put', () => {
    it('should put a new element', () => {
      expect(putById(emptyJsTable<T>(), 'id0', { v: 'value' }, init)).toEqual({
        byId: {
          id0: {
            id: 'id0',
            v: 'value',
            i: 0,
          },
        },
        allIds: ['id0'],
      });
    });

    const table = toJsTable<T>({
      id0: { v: '', i: 0 },
    });

    it('should not fail if there is already an element with that id and in prod', () => {
      environment.strictCoherence = false;

      expect(putById(table, 'id0', { i: 1 }, init)).toEqual({
        ...table,
        byId: {
          ...table.byId,
          id0: {
            ...table.byId.id0,
            i: 1,
          },
        },
      });
    });

    it('should fail if there is already an element with that id and in env', () => {
      expect(() => putById(table, 'id0', {}, init)).toThrow();
    });
  });

  describe('remove', () => {
    const table = toJsTable<T>({
      id0: init(),
    });

    it('should remove an element', () => {
      expect(removeById(table, 'id0')).toEqual(emptyJsTable());
    });

    it('should not fail if there is no element with that id and in prod', () => {
      environment.strictCoherence = false;
      expect(removeById(table, 'id1')).toEqual(table);
    });

    it('should fail if there is no element with that id and in env', () => {
      expect(() => removeById(emptyJsTable(), 'id0')).toThrow();
    });
  });

  describe('update', () => {
    const table = toJsTable<T>({
      id0: init(),
    });

    it('should update an element', () => {
      expect(updateById(table, 'id0', { v: 'value' })).toEqual({
        byId: {
          id0: {
            id: 'id0',
            v: 'value',
            i: 0,
          },
        },
        allIds: ['id0'],
      });
    });

    it('should not fail if there is no element with that id and in prod', () => {
      environment.strictCoherence = false;

      expect(updateById(table, 'id1', { v: 'value' })).toEqual(
        <any>{
          ...table,
          byId: {
            ...table.byId,
            // note: this is not the valid type but it's better than just failing in case of bug
            id1: {
              id: 'id1',
              v: 'value',
            },
          },
        }
      );
    });

    it('should fail if there is no element with that id and in env', () => {
      expect(() => updateById(emptyJsTable(), 'id0', {})).toThrow();
    });
  });

  describe('putAll', () => {
    const toPut = toJsTable<{ i: number }>({
      id1: { i: 1 },
      id2: { i: 2 },
    });

    it('should put many elements', () => {
      const table = toJsTable<T>({
        id0: init(),
      });

      expect(putAll(table, toPut, init)).toEqual({
        byId: {
          id0: {
            id: 'id0',
            v: '',
            i: 0,
          },
          id1: {
            id: 'id1',
            v: '',
            i: 1,
          },
          id2: {
            id: 'id2',
            v: '',
            i: 2,
          },
        },
        allIds: ['id0', 'id1', 'id2'],
      });
    });

    it('should not fail if there is already an element with that id and in prod', () => {
      environment.strictCoherence = false;

      const table = toJsTable<T>({
        id1: { v: 'value', i: 0 },
      });

      expect(putAll(table, toPut, init)).toEqual({
        byId: {
          id1: {
            id: 'id1',
            v: 'value',
            i: 1,
          },
          id2: {
            id: 'id2',
            v: '',
            i: 2,
          },
        },
        allIds: ['id1', 'id2'],
      });
    });

    it('should fail if there is already an element with that id and in env', () => {
      const table = toJsTable<T>({
        id1: init(),
      });

      expect(() => putAll(table, toPut, init)).toThrow();
    });
  });

  describe('merge', () => {
    const table = toJsTable<T>({
      id0: init(),
      id1: { ...init(), i: 1 },
    });

    describe('merge into', () => {
      const toMerge = toJsTable<{ v: string }>({
        id1: { v: 'value' },
        id2: { v: 'value1' },
      });

      it('should merge the elements into the table and keep the previous ones', () => {
        expect(mergeInto(table, toMerge, init)).toEqual({
          byId: {
            id0: {
              id: 'id0',
              v: '',
              i: 0,
            },
            id1: {
              id: 'id1',
              v: 'value',
              i: 1,
            },
            id2: {
              id: 'id2',
              v: 'value1',
              i: 0,
            },
          },
          allIds: ['id0', 'id1', 'id2'],
        });
      });
    });

    describe('merge only', () => {
      const toMerge = toJsTable<{ v: string }>({
        id1: { v: 'value' },
        id2: { v: 'value1' },
      });

      it('should merge the elements into the table and remove the previous ones while keeping existing data', () => {
        expect(mergeOnly(table, toMerge, init)).toEqual({
          byId: {
            id1: {
              id: 'id1',
              v: 'value',
              i: 1,
            },
            id2: {
              id: 'id2',
              v: 'value1',
              i: 0,
            },
          },
          allIds: ['id1', 'id2'],
        });
      });
    });
  });
});
