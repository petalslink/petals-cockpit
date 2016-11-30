/**
 * Copyright (C) 2016 Linagora
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

// ngrx
import { ActionReducer, Action } from '@ngrx/store';

// our interfaces
import { IConfigRecord } from '../interfaces/config.interface';

// our states
import { configRecordFactory } from './config.state';

// actions
import { ConfigActions } from './config.actions';
import { UserActions } from './user.actions';

function createConfigReducer(configR: IConfigRecord = configRecordFactory(), action: Action) {
  switch (action.type) {
    case ConfigActions.TOGGLE_THEME:
      return configR.set('isDarkTheme', !configR.get('isDarkTheme'));

    case ConfigActions.TOGGLE_SIDENAV:
      return configR.set('isSidenavVisible', !configR.get('isSidenavVisible'));

    case ConfigActions.CLOSE_SIDENAV:
      return configR.set('isSidenavVisible', false);

    case ConfigActions.CLOSE_SIDENAV_IF_MOBILE:
      if (configR.get('sidenavMode') === 'over') {
        return configR.set('isSidenavVisible', false);
      }
      return configR;

    case ConfigActions.OPEN_SIDENAV:
      return configR.set('isSidenavVisible', true);

    case ConfigActions.SET_SIDENAV_MODE:
      return configR.set('sidenavMode', action.payload);

    case UserActions.USR_IS_DISCONNECTED:
      return configRecordFactory();

    default:
      return configR;
  }
};

export const ConfigReducer: ActionReducer<IConfigRecord> = createConfigReducer;
