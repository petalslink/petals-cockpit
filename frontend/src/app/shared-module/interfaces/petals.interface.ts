import { List, Map } from 'immutable';

export interface IServiceUnit extends Map<any, any> {
  name: string;
}

export interface IComponent extends Map<any, any> {
  name: string;
  serviceUnits: List<IServiceUnit>;
}

export interface IContainer extends Map<any, any> {
  name: string;
  components: List<IComponent>;
}

export interface IBus extends Map<any, any> {
  name: string;
  containers: List<IContainer>;
}
