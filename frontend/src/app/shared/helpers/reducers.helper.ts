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

import { JsTable, updateById } from 'app/shared/helpers/jstable.helper';

interface Foldable { isFolded: boolean }

export function fold<M extends JsTable<Foldable>>(
  table: M,
  payload: { id: string }
) {
  if (!table.byId[payload.id] || table.byId[payload.id].isFolded) {
    return table;
  }

  return updateById(table, payload.id, { isFolded: true });
}

export function unfold<M extends JsTable<Foldable>>(
  table: M,
  payload: { id: string }
) {
  if (!table.byId[payload.id] || !table.byId[payload.id].isFolded) {
    return table;
  }

  return updateById(table, payload.id, { isFolded: false });
}

export function toggleFold<M extends JsTable<Foldable>>(
  table: M,
  payload: { id: string }
) {
  const e = table.byId[payload.id];

  if (!e) {
    return table;
  }

  if (e.isFolded) {
    return unfold(table, payload);
  }

  return fold(table, payload);
}
