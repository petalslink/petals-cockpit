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

import { IComponents } from '../components/components.interface';

export interface IContainerCommon {
  // from server
  id: string;
  name: string;
  ip: string;
  port: number;
  systemInfo: string;

  // for UI
  isFolded: boolean;
  isFetchingDetail: boolean;
}

export interface IContainerRow extends IContainerCommon {
  // from server
  components: Array<string>;
  // id of the containers available in the bus
  // only contains reachable containers but in order to
  // improve perfs, do not use an array (so we can avoid `find` later)
  // reachabilitiesId: { [key: string]: null };
}

export interface IContainer extends IContainerCommon {
  components: IComponents;
  // reachabilities: Array<???> // not made yet
}