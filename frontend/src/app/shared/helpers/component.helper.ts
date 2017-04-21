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

import { EComponentState } from '../../features/cockpit/workspaces/state/components/component.interface';
import { IContainersTable } from '../../features/cockpit/workspaces/state/containers/containers.interface';

/**
 * @param {string} state : The state you want to get the possible actions from. For example : 'Started'
 * @returns {{ actionName: string, newStateAfterAction: EComponentState }[]} : The possible new actions according to the state
 */
export function stateNameToPossibleActionsComponent(state: string): { actionName: string, newStateAfterAction: string }[] {
  switch (state) {
    case EComponentState.Shutdown:
      return [
        { actionName: 'Start', newStateAfterAction: EComponentState.Started },
        { actionName: 'Unload', newStateAfterAction: EComponentState.Unloaded }
      ];

    case EComponentState.Started:
      return [
        { actionName: 'Stop', newStateAfterAction: EComponentState.Stopped }
      ];

    case EComponentState.Stopped:
      return [
        { actionName: 'Start', newStateAfterAction: EComponentState.Started },
        { actionName: 'Unload', newStateAfterAction: EComponentState.Unloaded }
      ];

    case EComponentState.Loaded:
      return [
        { actionName: 'Start', newStateAfterAction: EComponentState.Started },
        { actionName: 'Install', newStateAfterAction: EComponentState.Shutdown },
        { actionName: 'Unload', newStateAfterAction: EComponentState.Unloaded }
      ];

    case EComponentState.Unknown:
      return [
        { actionName: 'Unload', newStateAfterAction: EComponentState.Unloaded }
      ];

    case EComponentState.Unloaded:
      // no possible new state here but it exists so handle it in order to not throw an error
      break;

    default:
      throw new Error(`Component state cannot be '${state}'`);
  }
}

export function getContainerOfComponent(containersTable: IContainersTable, componentId: string) {
  return containersTable
    .allIds
    .map(containerId => containersTable.byId[containerId])
    .find(container => container.components.includes(componentId));
}
