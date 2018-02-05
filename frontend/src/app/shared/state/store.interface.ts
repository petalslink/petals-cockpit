/**
 * Copyright (C) 2017-2018 Linagora
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

import { IBusesInProgressTable } from 'app/features/cockpit/workspaces/state/buses-in-progress/buses-in-progress.interface';
import { IBusesTable } from 'app/features/cockpit/workspaces/state/buses/buses.interface';
import { IComponentsTable } from 'app/features/cockpit/workspaces/state/components/components.interface';
import { IContainersTable } from 'app/features/cockpit/workspaces/state/containers/containers.interface';
import { IServiceAssembliesTable } from 'app/features/cockpit/workspaces/state/service-assemblies/service-assemblies.interface';
import { IServiceUnitsTable } from 'app/features/cockpit/workspaces/state/service-units/service-units.interface';
import { IServicesTable } from 'app/features/cockpit/workspaces/state/services/services.interface';
import { ISharedLibrariesTable } from 'app/features/cockpit/workspaces/state/shared-libraries/shared-libraries.interface';
import { IWorkspacesTable } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.interface';
import { IUi } from 'app/shared/state/ui.interface';
import { IUsersTable } from './users.interface';

export interface IStore {
  ui: IUi;
  users: IUsersTable;
  workspaces: IWorkspacesTable;
  buses: IBusesTable;
  busesInProgress: IBusesInProgressTable;
  containers: IContainersTable;
  components: IComponentsTable;
  services: IServicesTable;
  serviceUnits: IServiceUnitsTable;
  serviceAssemblies: IServiceAssembliesTable;
  sharedLibraries: ISharedLibrariesTable;
}
