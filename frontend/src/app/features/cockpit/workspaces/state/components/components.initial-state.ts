import { IComponentsTable } from './components.interface';

export function componentsTableFactory(): IComponentsTable {
  return {
    selectedComponentId: '',
    byId: {},
    allIds: []
  };
}
