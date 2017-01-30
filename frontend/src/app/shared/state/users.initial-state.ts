import { IUsersTable } from '../interfaces/users.interface';

export function usersState(): IUsersTable {
  return {
    connectedUserId: '',

    isConnecting: false,
    isConnected: true,
    isDisconnecting: false,
    connectionFailed: false,

    byId: {},
    allIds: []
  };
}
