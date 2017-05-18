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

import { IUi } from './ui.interface';
import { IUsersTable } from './users.interface';
import { IWorkspacesTable } from '../../features/cockpit/workspaces/state/workspaces/workspaces.interface';
import { IBusesTable } from '../../features/cockpit/workspaces/state/buses/buses.interface';
import { IBusesInProgressTable } from '../../features/cockpit/workspaces/state/buses-in-progress/buses-in-progress.interface';
import { IContainersTable } from '../../features/cockpit/workspaces/state/containers/containers.interface';
import { IComponentsTable } from '../../features/cockpit/workspaces/state/components/components.interface';
import { IServiceUnitsTable } from '../../features/cockpit/workspaces/state/service-units/service-units.interface';
import { IServiceAssembliesTable } from '../../features/cockpit/workspaces/state/service-assemblies/service-assemblies.interface';

export interface IStore {
  ui: IUi;
  users: IUsersTable;
  workspaces: IWorkspacesTable;
  buses: IBusesTable;
  busesInProgress: IBusesInProgressTable;
  containers: IContainersTable;
  components: IComponentsTable;
  serviceUnits: IServiceUnitsTable;
  serviceAssemblies: IServiceAssembliesTable;
}
