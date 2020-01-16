/**
 * Copyright (C) 2017-2020 Linagora
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

/**
 * @param state : the state you want to get the possible actions from. For example : 'Started'
 * @returns the possible new actions according to the state
 */
import {
  ComponentState,
  EComponentState,
} from '@shared/services/components.service';

export function stateNameToPossibleActionsComponent(
  state: ComponentState
): { actionName: string; newStateAfterAction: ComponentState }[] {
  switch (state) {
    case EComponentState.Shutdown:
      return [
        { actionName: 'Start', newStateAfterAction: EComponentState.Started },
        {
          actionName: 'Uninstall',
          newStateAfterAction: EComponentState.Loaded,
        },
        { actionName: 'Unload', newStateAfterAction: EComponentState.Unloaded },
      ];

    case EComponentState.Started:
      return [
        { actionName: 'Stop', newStateAfterAction: EComponentState.Stopped },
      ];

    case EComponentState.Stopped:
      return [
        { actionName: 'Start', newStateAfterAction: EComponentState.Started },
        {
          actionName: 'Uninstall',
          newStateAfterAction: EComponentState.Loaded,
        },
        { actionName: 'Unload', newStateAfterAction: EComponentState.Unloaded },
      ];

    case EComponentState.Loaded:
      return [
        {
          actionName: 'Install',
          newStateAfterAction: EComponentState.Shutdown,
        },
        { actionName: 'Unload', newStateAfterAction: EComponentState.Unloaded },
      ];

    case EComponentState.Unknown:
      return [
        { actionName: 'Unload', newStateAfterAction: EComponentState.Unloaded },
      ];

    case EComponentState.Unloaded:
      // no possible new state here but it exists so handle it in order to not throw an error
      break;

    default:
      throw new Error(`Component state cannot be '${state}'`);
  }
}
