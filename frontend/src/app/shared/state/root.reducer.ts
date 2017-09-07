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

import { ActionReducerMap } from '@ngrx/store';
import { storeFreeze } from 'ngrx-store-freeze';

import { BusesInProgressReducer } from 'app/features/cockpit/workspaces/state/buses-in-progress/buses-in-progress.reducer';
import { BusesReducer } from 'app/features/cockpit/workspaces/state/buses/buses.reducer';
import { ComponentsReducer } from 'app/features/cockpit/workspaces/state/components/components.reducer';
import { ContainersReducer } from 'app/features/cockpit/workspaces/state/containers/containers.reducer';
import { ServiceAssembliesReducer } from 'app/features/cockpit/workspaces/state/service-assemblies/service-assemblies.reducer';
import { ServiceUnitsReducer } from 'app/features/cockpit/workspaces/state/service-units/service-units.reducer';
import { SharedLibrariesReducer } from 'app/features/cockpit/workspaces/state/shared-libraries/shared-libraries.reducer';
import { WorkspacesReducer } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.reducer';
import { enableBatching } from 'app/shared/helpers/batch-actions.helper';
import { IStore } from 'app/shared/state/store.interface';
import { environment } from 'environments/environment';
import { UiReducer } from '../state/ui.reducer';
import { UsersReducer } from './users.reducer';

export const reducers: ActionReducerMap<IStore> = {
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
const metaReducersDev = [storeFreeze, enableBatching];

const metaReducersProd = [enableBatching];

export const metaReducers = environment.production
  ? metaReducersProd
  : metaReducersDev;
