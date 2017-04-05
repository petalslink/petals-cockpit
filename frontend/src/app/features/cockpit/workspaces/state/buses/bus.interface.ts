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

import { IContainers } from '../containers/containers.interface';

export interface IBusCommon {
  // from server
  id: string;
  name: string;
  importError: string;

  // for UI
  isFolded: boolean;
  isDiscarding: boolean;
  isFetchingDetails: boolean;
  isBeingRemoved: boolean;
}

// used within table
export interface IBusRow extends IBusCommon {
  // from server
  containers: string[];
}

// used in generated views
export interface IBus extends IBusCommon {
  containers: IContainers;
}
