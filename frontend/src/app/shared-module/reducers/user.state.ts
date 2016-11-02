import { makeTypedFactory } from 'typed-immutable-record';
import { IUser, IUserRecord } from '../interfaces/user.interface';

export const userFactory = makeTypedFactory<IUser, IUserRecord>({
  // from server
  name: null,
  username: null,
  password: null,

  // for UI
  isConnecting: false,
  isDisconnecting: false,
  isConnected: false,
  connectionFailed: false
});
