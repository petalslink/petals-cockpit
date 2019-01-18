/**
 * Copyright (C) 2017-2019 Linagora
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

import { ActionReducerMap } from '@ngrx/store';
import { storeFreeze } from 'ngrx-store-freeze';

import { environment } from '@env/environment';
import { enableBatching } from '@shared/helpers/batch-actions.helper';
import { initStateFromLocalStorage } from '@shared/helpers/local-storage.helper';
import { IStore } from '@shared/state/store.interface';
import { UiReducer } from '@shared/state/ui.reducer';
import { UsersReducer } from '@shared/state/users.reducer';
import { BusesInProgressReducer } from '@wks/state/buses-in-progress/buses-in-progress.reducer';
import { BusesReducer } from '@wks/state/buses/buses.reducer';
import { ComponentsReducer } from '@wks/state/components/components.reducer';
import { ContainersReducer } from '@wks/state/containers/containers.reducer';
import { EndpointsReducer } from '@wks/state/endpoints/endpoints.reducer';
import { InterfacesReducer } from '@wks/state/interfaces/interfaces.reducer';
import { ServiceAssembliesReducer } from '@wks/state/service-assemblies/service-assemblies.reducer';
import { ServiceUnitsReducer } from '@wks/state/service-units/service-units.reducer';
import { ServicesReducer } from '@wks/state/services/services.reducer';
import { SharedLibrariesReducer } from '@wks/state/shared-libraries/shared-libraries.reducer';
import { WorkspacesReducer } from '@wks/state/workspaces/workspaces.reducer';

export const reducers: ActionReducerMap<IStore> = {
  ui: UiReducer.reducer,
  users: UsersReducer.reducer,
  workspaces: WorkspacesReducer.reducer,
  buses: BusesReducer.reducer,
  busesInProgress: BusesInProgressReducer.reducer,
  containers: ContainersReducer.reducer,
  components: ComponentsReducer.reducer,
  endpoints: EndpointsReducer.reducer,
  interfaces: InterfacesReducer.reducer,
  services: ServicesReducer.reducer,
  serviceUnits: ServiceUnitsReducer.reducer,
  serviceAssemblies: ServiceAssembliesReducer.reducer,
  sharedLibraries: SharedLibrariesReducer.reducer,
};

// if environment is != from production
// use storeFreeze to avoid state mutation
const metaReducersDev = [
  storeFreeze,
  enableBatching,
  initStateFromLocalStorage,
];

const metaReducersProd = [enableBatching, initStateFromLocalStorage];

export const metaReducers = environment.production
  ? metaReducersProd
  : metaReducersDev;
