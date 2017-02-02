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

import { IserviceUnits } from '../service-units/service-units.interface';

export enum EComponentState { Started, Stopped, Loaded, Unloaded, Shutdown }
export enum EComponentType { BC, SE }

export interface IComponentCommon {
  // from server
  id: string;
  name: string;
  state: EComponentState;
  type: EComponentType;

  // for UI
  isFolded: boolean;
  isFetchingDetails: boolean;
}

export interface IComponentRow extends IComponentCommon {
  // from server
  serviceUnits: Array<string>;
}

export interface IComponent extends IComponentCommon {
  // from server
  serviceUnits: IserviceUnits;
}
