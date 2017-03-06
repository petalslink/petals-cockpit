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

// http://stackoverflow.com/a/41631732/2398593
export const ServiceUnitState = {
  Started: 'Started' as 'Started',
  Stopped: 'Stopped' as 'Stopped',
  Unloaded: 'Unloaded' as 'Unloaded',
  Shutdown: 'Shutdown' as 'Shutdown'
};

export interface IServiceUnitCommon {
  // from server
  id: string;
  name: string;
  state: keyof typeof ServiceUnitState;

  // for UI
  isFolded: boolean;
  isUpdatingState: boolean;
}

// tslint:disable-next-line:no-empty-interface
export interface IServiceUnitRow extends IServiceUnitCommon { }

// tslint:disable-next-line:no-empty-interface
export interface IServiceUnit extends IServiceUnitCommon { }
