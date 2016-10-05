import { ActionReducer, Action } from '@ngrx/store';
import { UserStateRecord, userStateFactory } from './user.state';

// actions
export const USR_IS_CONNECTING = 'USR_IS_CONNECTING';
export const USR_IS_CONNECTED = 'USR_IS_CONNECTED';
export const USR_IS_DISCONNECTING = 'USR_IS_DISCONNECTING';
export const USR_IS_DISCONNECTED = 'USR_IS_DISCONNECTED';
export const USR_CONNECTION_FAILED = 'USR_CONNECTION_FAILED';

export const UserReducer: ActionReducer<UserStateRecord> = (userState: UserStateRecord = userStateFactory(), action: Action) => {
  switch (action.type) {
    case USR_IS_CONNECTING:
      return userState
              .setIn(['isConnecting'], true)
              .setIn(['isConnected'], false)
              .setIn(['isDisconnecting'], false)
              .setIn(['connectionFailed'], false);

    case USR_IS_CONNECTED:
      return userState
              .setIn(['isConnected'], true)
              .setIn(['isConnecting'], false)
              .setIn(['isDisconnecting'], false)
              .setIn(['connectionFailed'], false);

    case USR_IS_DISCONNECTING:
      return userState
              .setIn(['isDisconnecting'], true)
              .setIn(['isConnecting'], false)
              .setIn(['isConnected'], true)
              .setIn(['connectionFailed'], false);

    case USR_IS_DISCONNECTED:
      return userState
              .setIn(['isConnected'], false)
              .setIn(['isConnecting'], false)
              .setIn(['isDisconnecting'], false)
              .setIn(['connectionFailed'], false);

    case USR_CONNECTION_FAILED:
      return userState
              .setIn(['connectionFailed'], true)
              .setIn(['isDisconnecting'], false)
              .setIn(['isConnecting'], false)
              .setIn(['isConnected'], false);

    default:
      return userState;
  }
};
