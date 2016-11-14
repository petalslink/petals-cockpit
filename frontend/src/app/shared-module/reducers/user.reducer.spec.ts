/**
 * Copyright (C) 2016 Linagora
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// our reducers
import { UserReducer } from './user.reducer';

// our actions
import { UserActions } from './user.actions';

// our states
import { userRecordFactory } from './user.state';

// our interfaces
import { IUserRecord } from './../interfaces/user.interface';

describe(`User Reducer`, () => {
  let stateR: IUserRecord;

  beforeAll(() => {
    stateR = userRecordFactory();
  });

  // DEFAULT
  it(`should return the same state (reference) if action.type doesn't match existing action`, () => {
    let nextStateR: IUserRecord = UserReducer(stateR, {type: ''});

    expect(stateR === nextStateR).toBeTruthy();
  });

  it(`should have a default state`, () => {
    let nextStateR: IUserRecord = UserReducer(stateR, {type: ''});
    let nextState = nextStateR.toJS();

    expect(nextState).toEqual(userRecordFactory().toJS());
  });

  // USR_IS_CONNECT*
  it(`${UserActions.USR_IS_CONNECTING}`, () => {
    let nextStateR: IUserRecord = UserReducer(stateR, {type: UserActions.USR_IS_CONNECTING});
    let nextState = nextStateR.toJS();

    let expectedState = {
      isConnecting: true,
      isConnected: false,
      isDisconnecting: false,
      connectionFailed: false
    };

    expect(nextState).toEqual(jasmine.objectContaining(expectedState));
  });

  it(`${UserActions.USR_IS_CONNECTED}`, () => {
    let nextStateR: IUserRecord = UserReducer(
      stateR,
      {
        type: UserActions.USR_IS_CONNECTED,
        payload: {
          name: 'Some name',
          username: 'Some username'
        }
      }
    );
    let nextState = nextStateR.toJS();

    let expectedState = {
      name: 'Some name',
      username: 'Some username',
      isConnecting: false,
      isConnected: true,
      isDisconnecting: false,
      connectionFailed: false
    };

    expect(nextState).toEqual(jasmine.objectContaining(expectedState));
  });

  // USR_IS_DISCONNECT*
  it(`${UserActions.USR_IS_DISCONNECTING}`, () => {
    let nextStateR: IUserRecord = UserReducer(stateR, { type: UserActions.USR_IS_DISCONNECTING });
    let nextState = nextStateR.toJS();

    let expectedState = {
      isDisconnecting: true,
      isConnecting: false,
      isConnected: true,
      connectionFailed: false
    };

    expect(nextState).toEqual(jasmine.objectContaining(expectedState));
  });

  it(`${UserActions.USR_IS_DISCONNECTED}`, () => {
    let nextStateR: IUserRecord = UserReducer(stateR, { type: UserActions.USR_IS_DISCONNECTED });
    let nextState = nextStateR.toJS();

    expect(nextState).toEqual(userRecordFactory().toJS());
  });

  // USR_CONNECTION_FAILED
  it(`${UserActions.USR_CONNECTION_FAILED}`, () => {
    let nextStateR: IUserRecord = UserReducer(stateR, { type: UserActions.USR_CONNECTION_FAILED });
    let nextState = nextStateR.toJS();

    let expectedState = {
      connectionFailed: true,
      isDisconnecting: false,
      isConnecting: false,
      isConnected: false
    };

    expect(nextState).toEqual(jasmine.objectContaining(expectedState));
  });

  // USR_DISCONNECTION_FAILED
  it(`${UserActions.USR_DISCONNECTION_FAILED}`, () => {
    let nextStateR: IUserRecord = UserReducer(stateR, { type: UserActions.USR_DISCONNECTION_FAILED });
    let nextState = nextStateR.toJS();

    let expectedState = {
      connectionFailed: false,
      isDisconnecting: false,
      isConnecting: false,
      isConnected: true
    };

    expect(nextState).toEqual(jasmine.objectContaining(expectedState));
  });
});
