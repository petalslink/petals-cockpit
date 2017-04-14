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

import { EServiceUnitState } from '../../features/cockpit/workspaces/state/service-units/service-unit.interface';
import { environment } from '../../../environments/environment';
import { IComponentsTable } from '../../features/cockpit/workspaces/state/components/components.interface';

/**
 * @param {string} state : The state you want to get the possible actions from. For example : 'Started'
 * @returns {{ actionName: string, newStateAfterAction: EServiceUnitState }[]} : The possible new actions according to the state
 */
export function stateNameToPossibleActionsServiceUnit(state: string): { actionName: string, newStateAfterAction: string }[] {
  switch (state) {
    case EServiceUnitState.Shutdown:
      return [
        { actionName: 'Start', newStateAfterAction: EServiceUnitState.Started },
        { actionName: 'Unload', newStateAfterAction: EServiceUnitState.Unloaded }
      ];

    case EServiceUnitState.Started:
      return [
        { actionName: 'Stop', newStateAfterAction: EServiceUnitState.Stopped }
      ];

    case EServiceUnitState.Stopped:
      return [
        { actionName: 'Start', newStateAfterAction: EServiceUnitState.Started },
        { actionName: 'Unload', newStateAfterAction: EServiceUnitState.Unloaded }
      ];

    case EServiceUnitState.Unloaded:
      // no possible new state here but it exists so handle it in order to not throw an error
      break;

    default:
      if (environment.debug) {
        console.debug(`Error in 'service-unit.helper' file, function 'stateNameToPossibleActionsServiceUnit'`);
      }

      throw new Error(`SU state cannot be '${state}'`);
  }
}

export function getComponentOfServiceUnit(componentsTable: IComponentsTable, serviceUnitId: string) {
  return componentsTable
    .allIds
    .map(componentId => componentsTable.byId[componentId])
    .find(component => component.serviceUnits.includes(serviceUnitId));
}
