import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { IStore } from './../../../../../shared/interfaces/store.interface';
import { IComponentRow } from './component.interface';
import { _getCurrentWorkspace } from '../workspaces/workspaces.selectors';

export function _getCurrentComponent(store$: Store<IStore>): Observable<IComponentRow> {
  return store$.select(state => state.components)
    .filter(components => components.selectedComponentId !== '')
    .map(components => {
      let component = components.byId[components.selectedComponentId];

      return component;
    });
}

export function getCurrentComponent() {
  return _getCurrentComponent;
}
