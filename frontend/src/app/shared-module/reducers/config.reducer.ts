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
import { configFactory } from './config.state';

// our reducers
import { USR_IS_DISCONNECTED } from './user.reducer';

// actions
export const TOGGLE_THEME = 'TOGGLE_THEME ';

function createConfigReducer(configR: IConfigRecord = configFactory(), action: Action) {
  switch (action.type) {
    case TOGGLE_THEME:
      return configR.setIn(['isDarkTheme'], !configR.isDarkTheme);

    case USR_IS_DISCONNECTED:
      return configFactory();

    default:
      return configR;
  }
};

export const ConfigReducer: ActionReducer<IConfigRecord> = createConfigReducer;
