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

  // -------------------------------------------------------------------------------------------

  // tslint:disable-next-line:member-ordering
  private static mapActionsToMethod = {
    [Users.FETCH_USERS_SUCCESS]: Users.fetchUsersSuccess
  };
}
