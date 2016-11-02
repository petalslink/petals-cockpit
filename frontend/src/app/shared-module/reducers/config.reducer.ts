// ngrx
import { ActionReducer, Action } from '@ngrx/store';

// our interfaces
import { IConfigRecord } from '../interfaces/config.interface';
import { configFactory } from './config.state';

// actions
export const TOGGLE_THEME = 'TOGGLE_THEME ';

function createConfigReducer(configR: IConfigRecord = configFactory(), action: Action) {
  switch (action.type) {
    case TOGGLE_THEME:
      return configR.setIn(['isDarkTheme'], !configR.isDarkTheme);

    default:
      return configR;
  }
};

export const ConfigReducer: ActionReducer<IConfigRecord> = createConfigReducer;
