import { Containers } from '../../features/cockpit/workspaces/state/containers/containers.reducer';
import { IUi } from './ui.interface';
import { IUsersTable } from './users.interface';
import { IWorkspacesTable } from '../../features/cockpit/workspaces/state/workspaces/workspaces.interface';
import { IBusesTable } from '../../features/cockpit/workspaces/state/buses/buses.interface';
import { IBusesInProgressTable } from '../../features/cockpit/workspaces/state/buses-in-progress/buses-in-progress.interface';
import { IContainersTable } from '../../features/cockpit/workspaces/state/containers/containers.interface';
import { IComponentsTable } from '../../features/cockpit/workspaces/state/components/components.interface';
import { IserviceUnitsTable } from '../../features/cockpit/workspaces/state/service-units/service-units.interface';

export interface IStore {
  ui: IUi;
  users: IUsersTable;
  workspaces: IWorkspacesTable;
  buses: IBusesTable;
  busesInProgress: IBusesInProgressTable;
  containers: IContainersTable;
  components: IComponentsTable;
  serviceUnits: IserviceUnitsTable;
}
