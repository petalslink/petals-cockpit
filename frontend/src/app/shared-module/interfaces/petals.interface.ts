import { List, Map } from 'immutable';

export interface IServiceUnit extends Map<any, any> {
  id: string;
  name: string;
}

export interface IComponent extends Map<any, any> {
  id: string;
  name: string;
  serviceUnits: List<IServiceUnit>;
  selectedServiceUnitId: number;
}

export interface IContainer extends Map<any, any> {
  id: string;
  name: string;
  components: List<IComponent>;
  selectedComponentId: number;
}

export interface IBus extends Map<any, any> {
  id: string;
  name: string;
  containers: List<IContainer>;
  selectedContainerId: number;
}
