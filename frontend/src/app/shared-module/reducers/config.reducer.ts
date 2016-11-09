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
