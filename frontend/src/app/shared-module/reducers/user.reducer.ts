// ngrx
import { ActionReducer, Action } from '@ngrx/store';

// our interfaces
import { IUserRecord } from '../interfaces/user.interface';
import { userFactory } from './user.state';

// actions
export const USR_IS_CONNECTING = 'USR_IS_CONNECTING';
export const USR_IS_CONNECTED = 'USR_IS_CONNECTED';
export const USR_IS_DISCONNECTING = 'USR_IS_DISCONNECTING';
export const USR_IS_DISCONNECTED = 'USR_IS_DISCONNECTED';
export const USR_CONNECTION_FAILED = 'USR_CONNECTION_FAILED';
export const USR_DISCONNECTION_FAILED = 'USR_DISCONNECTION_FAILED';

function createUserReducer (userR: IUserRecord = userFactory(), action: Action) {
  switch (action.type) {
    case USR_IS_CONNECTING:
      return userR
              .setIn(['isConnecting'], true)
              .setIn(['isConnected'], false)
              .setIn(['isDisconnecting'], false)
              .setIn(['connectionFailed'], false);

    case USR_IS_CONNECTED:
      return userR
              .setIn(['name'], action.payload.name)
              .setIn(['username'], action.payload.username)
              .setIn(['isConnected'], true)
              .setIn(['isConnecting'], false)
              .setIn(['isDisconnecting'], false)
              .setIn(['connectionFailed'], false);

    case USR_IS_DISCONNECTING:
      return userR
              .setIn(['isDisconnecting'], true)
              .setIn(['isConnecting'], false)
              .setIn(['isConnected'], true)
              .setIn(['connectionFailed'], false);

    case USR_IS_DISCONNECTED:
      return userFactory();

    case USR_CONNECTION_FAILED:
      return userR
              .setIn(['connectionFailed'], true)
              .setIn(['isDisconnecting'], false)
              .setIn(['isConnecting'], false)
              .setIn(['isConnected'], false);

    case USR_DISCONNECTION_FAILED:
      return userR
              .setIn(['connectionFailed'], false)
              .setIn(['isDisconnecting'], false)
              .setIn(['isConnecting'], false)
              .setIn(['isConnected'], true);

    default:
      return userR;
  }
};

export const UserReducer: ActionReducer<IUserRecord> = createUserReducer;
