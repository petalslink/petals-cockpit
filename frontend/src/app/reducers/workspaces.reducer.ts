import { ActionReducer, Action } from '@ngrx/store';
import { WorkspacesStateRecord, workspacesStateFactory } from './workspaces.state';

// actions
export const WKS_CHANGE = 'USR_IS_CONNECTING';

export const WorkspacesReducer: ActionReducer<WorkspacesStateRecord> = (userState: WorkspacesStateRecord = workspacesStateFactory(), action: Action) => {
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
