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

import {
  ServiceAssemblyState,
  EServiceAssemblyState
} from 'app/features/cockpit/workspaces/state/service-assemblies/service-assembly.interface';

/**
 * @param state : The state you want to get the possible actions from. For example : 'Started'
 * @returns The possible new actions according to the state
 */
export function stateNameToPossibleActionsServiceAssembly(
  state: ServiceAssemblyState
): { actionName: string, newStateAfterAction: ServiceAssemblyState }[] {
  switch (state) {
    case EServiceAssemblyState.Shutdown:
      return [
        { actionName: 'Start', newStateAfterAction: EServiceAssemblyState.Started },
        { actionName: 'Unload', newStateAfterAction: EServiceAssemblyState.Unloaded }
      ];

    case EServiceAssemblyState.Started:
      return [
        { actionName: 'Stop', newStateAfterAction: EServiceAssemblyState.Stopped }
      ];

    case EServiceAssemblyState.Stopped:
      return [
        { actionName: 'Start', newStateAfterAction: EServiceAssemblyState.Started },
        { actionName: 'Unload', newStateAfterAction: EServiceAssemblyState.Unloaded }
      ];

    case EServiceAssemblyState.Unknown:
      return [
        { actionName: 'Unload', newStateAfterAction: EServiceAssemblyState.Unloaded }
      ];

    case EServiceAssemblyState.Unloaded:
      // no possible new state here but it exists so handle it in order to not throw an error
      break;

    default:
      throw new Error(`SA state cannot be '${state}'`);
  }
}
