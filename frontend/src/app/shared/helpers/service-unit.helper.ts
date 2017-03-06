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

import { ServiceUnitState } from '../../features/cockpit/workspaces/state/service-units/service-unit.interface';
import { environment } from '../../../environments/environment';

/**
 * @param {string} state : The state you want to get the possible actions from. For example : 'Started'
 * @returns {{ actionName: string, newStateAfterAction: EServiceUnitState }[]} : The possible new actions according to the state
 */
export function stateNameToPossibleActions(state: string): { actionName: string, newStateAfterAction: string }[] {
  switch (state) {
    case ServiceUnitState.Shutdown:
      return [
        { actionName: 'Start', newStateAfterAction: ServiceUnitState.Started },
        { actionName: 'Unload', newStateAfterAction: ServiceUnitState.Unloaded }
      ];

    case ServiceUnitState.Started:
      return [
        { actionName: 'Stop', newStateAfterAction: ServiceUnitState.Stopped }
      ];

    case ServiceUnitState.Stopped:
      return [
        { actionName: 'Start', newStateAfterAction: ServiceUnitState.Started },
        { actionName: 'Unload', newStateAfterAction: ServiceUnitState.Unloaded }
      ];

    case ServiceUnitState.Unloaded:
      // no possible new state here but it exists so handle it in order to not throw an error
      break;

    default:
      if (environment.debug) {
        console.debug(`Error in 'service-unit.helper' file, function 'stateNameToPossibleActions'`);
      }

      throw new Error(`SU state cannot be '${state}'`);
  }
}
