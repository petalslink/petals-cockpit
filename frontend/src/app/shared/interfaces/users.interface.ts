import { IUserRow, IUser } from './user.interface';

interface IUsersCommon {
  connectedUserId: string;

  isConnecting: boolean;
  isConnected: boolean;
  isDisconnecting: boolean;
  connectionFailed: boolean;
}

export interface IUsersTableOnly {
  byId: { [key: string]: IUserRow };
  allIds: Array<string>;
}

export interface IUsersTable extends IUsersCommon, IUsersTableOnly { }

export interface IUsers extends IUsersCommon {
  list: Array<IUser>;
}
