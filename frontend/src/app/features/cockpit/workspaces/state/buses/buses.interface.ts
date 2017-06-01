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

import { IBusRow, IBus } from './bus.interface';
import { JsMap, emptyJavascriptMap } from 'app/shared/helpers/map.helper';

export interface IBusesCommon {
  selectedBusId: string;
}

export interface IBusesTable extends IBusesCommon, JsMap<IBusRow> { }

export interface IBuses extends IBusesCommon {
  list: IBus[];
}

export function busesTableFactory(): IBusesTable {
  return Object.assign({}, emptyJavascriptMap<IBusRow>(), {
    selectedBusId: ''
  });
}
