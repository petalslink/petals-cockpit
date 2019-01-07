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

import { IUi } from '@shared/state/ui.interface';
import { IBusesInProgressTable } from '@wks/state/buses-in-progress/buses-in-progress.interface';
import { IBusesTable } from '@wks/state/buses/buses.interface';
import { IComponentsTable } from '@wks/state/components/components.interface';
import { IContainersTable } from '@wks/state/containers/containers.interface';
import { IEndpointsTable } from '@wks/state/endpoints/endpoints.interface';
import { IInterfacesTable } from '@wks/state/interfaces/interfaces.interface';
import { IServiceAssembliesTable } from '@wks/state/service-assemblies/service-assemblies.interface';
import { IServiceUnitsTable } from '@wks/state/service-units/service-units.interface';
import { IServicesTable } from '@wks/state/services/services.interface';
import { ISharedLibrariesTable } from '@wks/state/shared-libraries/shared-libraries.interface';
import { IWorkspacesTable } from '@wks/state/workspaces/workspaces.interface';
import { IUsersTable } from './users.interface';

export interface IStore {
  ui: IUi;
  users: IUsersTable;
  workspaces: IWorkspacesTable;
  buses: IBusesTable;
  busesInProgress: IBusesInProgressTable;
  containers: IContainersTable;
  components: IComponentsTable;
  interfaces: IInterfacesTable;
  endpoints: IEndpointsTable;
  services: IServicesTable;
  serviceUnits: IServiceUnitsTable;
  serviceAssemblies: IServiceAssembliesTable;
  sharedLibraries: ISharedLibrariesTable;
}
