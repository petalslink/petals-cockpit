import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { IStore } from '../../../../../shared/interfaces/store.interface';
import { _getCurrentWorkspace } from '../workspaces/workspaces.selectors';
import { IContainerRow } from './container.interface';

export function _getCurrentContainer(store$: Store<IStore>): Observable<IContainerRow> {
  return store$.select(state => state.containers)
    .filter(containers => containers.selectedContainerId !== '')
    .map(containers => {
      const container = containers.byId[containers.selectedContainerId];

      return container;
    });
}

export function getCurrentContainer() {
  return _getCurrentContainer;
}
