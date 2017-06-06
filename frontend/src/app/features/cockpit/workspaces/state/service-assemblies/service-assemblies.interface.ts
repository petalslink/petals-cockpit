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

import { IServiceAssemblyRow, IServiceAssembly } from './service-assembly.interface';

interface IServiceAssembliesCommon {
  selectedServiceAssemblyId: string;
  isFetchingDetails: boolean;
}

export interface IServiceAssembliesTable extends IServiceAssembliesCommon {
  byId: { [key: string]: IServiceAssemblyRow };
  allIds: string[];
}

export interface IServiceAssemblies extends IServiceAssembliesCommon {
  list: IServiceAssembly[];
}

export function serviceAssembliesTableFactory(): IServiceAssembliesTable {
  return {
    selectedServiceAssemblyId: '',
    isFetchingDetails: false,

    byId: {},
    allIds: []
  };
}