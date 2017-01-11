import { combineReducers, provideStore } from '@ngrx/store';
import { compose } from '@ngrx/core/compose';
import { storeFreeze } from 'ngrx-store-freeze';
import { enableBatching } from 'redux-batched-actions';

import { IStore } from './../interfaces/store.interface';
import { environment } from './../../../environments/environment';
import { Ui } from '../state/ui.reducer';
import { Users } from './users.reducer';
import { Workspaces } from './../../features/cockpit/workspaces/state/workspaces/workspaces.reducer';
import { Buses } from '../../features/cockpit/workspaces/state/buses/buses.reducer';
import { Containers } from './../../features/cockpit/workspaces/state/containers/containers.reducer';
import { Components } from './../../features/cockpit/workspaces/state/components/components.reducer';
import { ServiceUnits } from './../../features/cockpit/workspaces/state/service-units/service-units.reducer';

const reducers = {
  ui: Ui.reducer,
  users: Users.reducer,
  workspaces: Workspaces.reducer,
  buses: Buses.reducer,
  containers: Containers.reducer,
  components: Components.reducer,
  serviceUnits: ServiceUnits.reducer
};

// if environment is != from production
// use storeFreeze to avoid state mutation
const developmentReducer = compose(storeFreeze, enableBatching, combineReducers)(reducers);
const productionReducer = compose(enableBatching, combineReducers)(reducers);

// enableBatching allows us to dispatch multiple actions
// without letting the subscribers being warned between the actions
// only at the end : https://github.com/tshelburne/redux-batched-actions
// can be very handy when normalizing HTTP response
export function getRootReducer(state: any, action: any) {
  if (environment.production) {
    return productionReducer(state, action);
  } else {
    return developmentReducer(state, action);
  }
}
