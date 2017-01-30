import { IComponentRow, IComponent } from './component.interface';

export interface IComponentsCommon {
  selectedComponentId: string;
}

export interface IComponentsTable extends IComponentsCommon {
  byId: { [key: string]: IComponentRow };
  allIds: Array<string>;
}

export interface IComponents extends IComponentsCommon {
  list: Array<IComponent>;
}
