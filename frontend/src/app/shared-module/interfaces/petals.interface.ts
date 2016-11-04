import { TypedRecord } from 'typed-immutable-record';

import { IBusConfig } from './bus-config.interface';

export interface IServiceUnit {
  id: string;
  name: string;
}

export interface IServiceUnitRecord extends TypedRecord<IServiceUnitRecord>, IServiceUnit { };

export interface IComponent {
  id: string;
  name: string;
  serviceUnits: Array<IServiceUnit>;
  selectedServiceUnitId: number;
}

export interface IComponentRecord extends TypedRecord<IComponentRecord>, IComponent { };

export interface IContainer {
  id: string;
  name: string;
  components: Array<IComponent>;
  selectedComponentId: number;
}

export interface IContainerRecord extends TypedRecord<IContainerRecord>, IContainer { };

export interface IBus {
  id: string;
  name: string;
  state: string;
  config: IBusConfig;
  containers: Array<IContainer>;
  selectedContainerId: number;
  importError: string;
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
