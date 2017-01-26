import { IUsersTable } from '../interfaces/users.interface';
import { ActionReducer, Action } from '@ngrx/store';

import { IUi } from '../interfaces/ui.interface';
import { usersState } from './users.initial-state';

export class Users {
  private static reducerName = 'USERS_REDUCER';

  public static reducer(users = usersState(), {type, payload}: Action) {
    if (typeof Users.mapActionsToMethod[type] === 'undefined') {
      return users;
    }

    return Users.mapActionsToMethod[type](users, payload);
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_USERS_SUCCESS = `${Users.reducerName}_FETCH_USERS_SUCCESS`;
  private static fetchUsersSuccess(users: IUsersTable, payload) {
    return Object.assign(<IUsersTable>{}, users, payload);
  }

  // tslint:disable-next-line:member-ordering
  public static CONNECT_USER = `${Users.reducerName}_CONNECT_USER`;
  private static connectUser(users: IUsersTable, payload) {
    return Object.assign(<IUsersTable>{}, users, <IUsersTable>{ isConnecting: true });
  }

  // tslint:disable-next-line:member-ordering
  public static CONNECT_USER_SUCCESS = `${Users.reducerName}_CONNECT_USER_SUCCESS`;
  private static connectUserSuccess(users: IUsersTable, payload) {
    return Object.assign(<IUsersTable>{}, users, <IUsersTable>{
      isConnecting: false,
      isConnected: true,
      connectionFailed: false,
      connectedUserId: payload.id
    });
  }

  // tslint:disable-next-line:member-ordering
  public static CONNECT_USER_FAILED = `${Users.reducerName}_CONNECT_USER_FAILED`;
  private static connectUserFailed(users: IUsersTable, payload) {
    return Object.assign(<IUsersTable>{}, users, <IUsersTable>{
      isConnecting: false,
      connectionFailed: true
    });
  }

  // -------------------------------------------------------------------------------------------

  // tslint:disable-next-line:member-ordering
  private static mapActionsToMethod = {
    [Users.FETCH_USERS_SUCCESS]: Users.fetchUsersSuccess,
    [Users.CONNECT_USER]: Users.connectUser,
    [Users.CONNECT_USER_SUCCESS]: Users.connectUserSuccess,
    [Users.CONNECT_USER_FAILED]: Users.connectUserFailed
  };
}
