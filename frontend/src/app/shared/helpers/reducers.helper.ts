/**
 * Copyright (C) 2017-2019 Linagora
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

import { JsTable, updateById } from '@shared/helpers/jstable.helper';

export function fold<E extends { isFolded: boolean }, M extends JsTable<E>>(
  table: M,
  payload: { id: string },
  property: keyof E = 'isFolded'
): M {
  if (!table.byId[payload.id] || table.byId[payload.id][property]) {
    return table;
  }

  return updateById(table, payload.id, { [property]: true });
}

export function unfold<E extends { isFolded: boolean }, M extends JsTable<E>>(
  table: M,
  payload: { id: string },
  property: keyof E = 'isFolded'
): M {
  if (!table.byId[payload.id] || !table.byId[payload.id][property]) {
    return table;
  }

  return updateById(table, payload.id, { [property]: false });
}

export function toggleFold<
  E extends { isFolded: boolean },
  M extends JsTable<E>
>(table: M, payload: { id: string }, property: keyof E = 'isFolded'): M {
  const e = table.byId[payload.id];

  if (!e) {
    return table;
  }

  if (e[property]) {
    return unfold<E, M>(table, payload, property);
  }

  return fold<E, M>(table, payload, property);
}
