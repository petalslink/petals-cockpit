/**
 * Copyright (C) 2016 Linagora
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

import { TypedRecord } from 'typed-immutable-record';

import { IBusConfig } from './bus-config.interface';

export interface IServiceUnit {
  id: string;
  name: string;
  state: string;

  // UI
  // is the service unit folded into petals menu ?
  isFolded: boolean;
}

export interface IServiceUnitRecord extends TypedRecord<IServiceUnitRecord>, IServiceUnit { };

export interface IComponent {
  id: string;
  name: string;
  state: string;
  type: string;
  serviceUnits: Array<IServiceUnit>;
  selectedServiceUnitId: number;

  // UI
  // is the component folded into petals menu ?
  isFolded: boolean;
  isUpdatingState: boolean;
}

export interface IComponentRecord extends TypedRecord<IComponentRecord>, IComponent { };

export interface IContainer {
  id: string;
  name: string;
  components: Array<IComponent>;
  selectedComponentId: number;

  // overview view
  ip: string;
  port: number;

  // UI
  // is the container folded into petals menu ?
  isFolded: boolean;
}

export interface IContainerRecord extends TypedRecord<IContainerRecord>, IContainer { };

export interface IBus {
  id: string;
  name: string;
  config: IBusConfig;
  containers: Array<IContainer>;
  importError: string;

  // UI
  // is the user trying to remove this bus ?
  removing: boolean;
  // is the bus folded into petals menu ?
  isFolded: boolean;
  isFetchingDetails: boolean;
}

export interface IBusRecord extends TypedRecord<IBusRecord>, IBus { };

// used when we add (import) a bus
export interface INewBus {
  ip: string;
  port: number;
  username: string;
  password: string;
  passphrase: string;
}

export interface INewBusRecord extends TypedRecord<INewBusRecord>, INewBus { };
