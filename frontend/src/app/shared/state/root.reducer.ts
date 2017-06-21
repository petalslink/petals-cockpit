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

import { combineReducers } from '@ngrx/store';
import { compose } from '@ngrx/core/compose';
import { storeFreeze } from 'ngrx-store-freeze';

import { environment } from '../../../environments/environment';
import { UiReducer } from '../state/ui.reducer';
import { UsersReducer } from './users.reducer';
import { WorkspacesReducer } from '../../features/cockpit/workspaces/state/workspaces/workspaces.reducer';
import { BusesReducer } from '../../features/cockpit/workspaces/state/buses/buses.reducer';
import { BusesInProgressReducer } from '../../features/cockpit/workspaces/state/buses-in-progress/buses-in-progress.reducer';
import { ContainersReducer } from '../../features/cockpit/workspaces/state/containers/containers.reducer';
import { ComponentsReducer } from '../../features/cockpit/workspaces/state/components/components.reducer';
import { ServiceUnitsReducer } from '../../features/cockpit/workspaces/state/service-units/service-units.reducer';
import { enableBatching } from 'app/shared/helpers/batch-actions.helper';
import { ServiceAssembliesReducer } from 'app/features/cockpit/workspaces/state/service-assemblies/service-assemblies.reducer';
import { SharedLibrariesReducer } from 'app/features/cockpit/workspaces/state/shared-libraries/shared-libraries.reducer';

const reducers = {
  ui: UiReducer.reducer,
  users: UsersReducer.reducer,
  workspaces: WorkspacesReducer.reducer,
  buses: BusesReducer.reducer,
  busesInProgress: BusesInProgressReducer.reducer,
  containers: ContainersReducer.reducer,
  components: ComponentsReducer.reducer,
  serviceUnits: ServiceUnitsReducer.reducer,
  serviceAssemblies: ServiceAssembliesReducer.reducer,
  sharedLibraries: SharedLibrariesReducer.reducer,
};

// if environment is != from production
// use storeFreeze to avoid state mutation
const developmentReducer = compose(
  storeFreeze,
  enableBatching,
  combineReducers
)(reducers);
const productionReducer = compose(enableBatching, combineReducers)(reducers);

// enableBatching allows us to dispatch multiple actions
// without letting the subscribers being warned between the actions
// only at the end. It is very handy when normalizing HTTP response
export function getRootReducer(state: any, action: any) {
  if (environment.production) {
    return productionReducer(state, action);
  } else {
    return developmentReducer(state, action);
  }
}
