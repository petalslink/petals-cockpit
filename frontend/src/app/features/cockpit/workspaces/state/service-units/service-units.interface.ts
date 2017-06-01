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

import { IServiceUnitRow, IServiceUnit } from './service-unit.interface';
import { JsMap, emptyJavascriptMap } from 'app/shared/helpers/map.helper';

interface IServiceUnitsCommon {
  selectedServiceUnitId: string;
  isFetchingDetails: boolean;
}

export interface IServiceUnitsTable extends IServiceUnitsCommon, JsMap<IServiceUnitRow> { }

export interface IServiceUnits extends IServiceUnitsCommon {
  list: IServiceUnit[];
}

export function serviceUnitsTableFactory(): IServiceUnitsTable {
  return Object.assign({}, emptyJavascriptMap<IServiceUnitRow>(), {
    selectedServiceUnitId: '',
    isFetchingDetails: false
  });
}
