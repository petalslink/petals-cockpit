/**
 * Copyright (C) 2017 Linagora
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

import { Users } from 'app/shared/state/users.reducer';
import { environment } from 'environments/environment';

describe(`Users reducer`, () => {
  it(`should have a default value`, () => {
    expect(Users.reducer(undefined, { type: `init`, payload: `` }))
      .toEqual({
        connectedUserId: '',

        isConnecting: false,
        isConnected: environment.mock.alreadyConnected,
        isDisconnecting: false,
        connectionFailed: false,

        byId: {},
        allIds: []
      });
  });

  describe(Users.FETCH_USERS_SUCCESS, () => {
    it(`should check action name`, () => {
      expect(Users.FETCH_USERS_SUCCESS).toEqual(`[Users] Fetch users success`);
    });

    it(`should add new users`, () => {
      const reducer = Users.reducer(undefined, {
        type: Users.FETCH_USERS_SUCCESS,
        payload: {
          byId: {
            user1: {
              id: 'user1',
              name: 'User 1'
            },
            user2: {
              id: 'user2',
              name: 'User 2'
            }
          },
          allIds: ['user1', 'user2']
        }
      });

      expect(reducer.byId).toEqual({
        user1: {
          id: 'user1',
          name: 'User 1'
        },
        user2: {
          id: 'user2',
          name: 'User 2'
        }
      });

      expect(reducer.allIds).toEqual(['user1', 'user2']);
    });

    it(`should replace already existing users`, () => {
      const initialState = <any>{
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          user1: {
            keepPreviousValues: '',
            id: 'user1',
            name: 'User 1'
          },
          user2: {
            keepPreviousValues: '',
            id: 'user2',
            name: 'User 2'
          }
        },
        allIds: ['user1', 'user2']
      };

      const reducer = Users.reducer(initialState, {
        type: Users.FETCH_USERS_SUCCESS,
        payload: {
          byId: {
            user1: {
              id: 'user1',
              name: 'User 1 updated name'
            },
            user2: {
              id: 'user2',
              name: 'User 2 updated name'
            }
          },
          allIds: ['user1', 'user2']
        }
      });

      expect(reducer.byId).toEqual({
        keepPreviousValues: '',
        user1: {
          keepPreviousValues: '',
          id: 'user1',
          name: 'User 1 updated name'
        },
        user2: {
          keepPreviousValues: '',
          id: 'user2',
          name: 'User 2 updated name'
        }
      });

      expect(reducer.allIds).toEqual(['user1', 'user2']);
    });
  });

  describe(Users.CONNECT_USER, () => {
    it(`should check action name`, () => {
      expect(Users.CONNECT_USER).toEqual(`[Users] Connect user`);
    });

    it(`should set isConnecting to true from initial state no matter the payload`, () => {
      expect(Users.reducer(undefined, {
        type: Users.CONNECT_USER,
        payload: { noMatter: 'the payload' }
      })).toEqual({
        connectedUserId: '',

        isConnecting: true,
        isConnected: environment.mock.alreadyConnected,
        isDisconnecting: false,
        connectionFailed: false,

        byId: {},
        allIds: []
      });
    });

    it(`should set isConnecting to true and only that with a given initial state and no matter the payload`, () => {
      expect(Users.reducer(<any>{}, {
        type: Users.CONNECT_USER,
        payload: { noMatter: 'the payload' }
      })).toEqual({
        isConnecting: true
      });
    });
  });

  describe(Users.CONNECT_USER_SUCCESS, () => {
    it(`should check action name`, () => {
      expect(Users.CONNECT_USER_SUCCESS).toEqual(`[Users] Connect user success`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      isConnecting: true,
      isConnected: false,
      connectionFailed: false,
      connectedUserId: '',
      byId: {
        keepPreviousValues: ''
      },
      allIds: []
    };

    it(`should connect the user and make sure that UI variable are the ones expected`, () => {
      const reducer = Users.reducer(initialState, {
        type: Users.CONNECT_USER_SUCCESS,
        payload: {
          user: { id: 'user1', name: 'name' }
        }
      });

      expect(reducer).toEqual({
        keepPreviousValues: '',
        isConnecting: false,
        isConnected: true,
        connectionFailed: false,
        connectedUserId: 'user1',
        isDisconnecting: false,
        byId: {
          keepPreviousValues: '',
          user1: { id: 'user1', name: 'name' }
        },
        allIds: ['user1']
      });
    });

    it(`should connect the user and add him if he doesn't exists yet`, () => {
      const reducer = Users.reducer(initialState, {
        type: Users.CONNECT_USER_SUCCESS,
        payload: {
          user: {
            id: 'user1',
            name: 'User 1',
            lastWorkspace: 'idWks0'
          }
        }
      });

      expect(reducer.byId).toEqual({
        keepPreviousValues: '',
        user1: {
          id: 'user1',
          name: 'User 1',
          lastWorkspace: 'idWks0'
        }
      });

      expect(reducer.allIds).toEqual(['user1']);
    });
  });

  describe(Users.CONNECT_USER_FAILED, () => {
    it(`should check action name`, () => {
      expect(Users.CONNECT_USER_FAILED).toEqual(`[Users] Connect user failed`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      isConnecting: true,
      isConnected: false,
      connectionFailed: false,
      connectedUserId: '',
      byId: {
        keepPreviousValues: ''
      },
      allIds: []
    };

    it(`should make sure that when a user couldn't connect we set correct values`, () => {
      const reducer = Users.reducer(initialState, {
        type: Users.CONNECT_USER_FAILED,
        payload: { noMatter: 'the payload' }
      });

      expect(reducer).toEqual({
        keepPreviousValues: '',
        isConnecting: false,
        isConnected: false,
        connectionFailed: true,
        connectedUserId: '',
        byId: {
          keepPreviousValues: ''
        },
        allIds: []
      });

      expect(reducer.byId).toEqual({
        keepPreviousValues: ''
      });
      expect(reducer.allIds).toEqual([]);
    });
  });

  describe(Users.DISCONNECT_USER, () => {
    it(`should check action name`, () => {
      expect(Users.DISCONNECT_USER).toEqual(`[Users] Disconnect user`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      isConnecting: false,
      isConnected: true,
      connectionFailed: false,
      connectedUserId: 'user1',
      byId: {
        keepPreviousValues: '',
        user1: {
          keepPreviousValues: '',
          id: 'user1',
          name: 'User 1',
          lastWorkspace: 'idWks0'
        },
        user2: {
          keepPreviousValues: '',
          id: 'user2',
          name: 'User 2',
          lastWorkspace: ''
        }
      },
      allIds: ['user1', 'user2']
    };

    it(`should only toggle isDisconnecting boolean to true without affecting other values`, () => {
      expect(Users.reducer(initialState, {
        type: Users.DISCONNECT_USER,
        payload: { noMatter: 'the payload' }
      })).toEqual({
        keepPreviousValues: '',
        isConnecting: false,
        isConnected: true,
        connectionFailed: false,
        isDisconnecting: true,
        connectedUserId: 'user1',
        byId: {
          keepPreviousValues: '',
          user1: {
            keepPreviousValues: '',
            id: 'user1',
            name: 'User 1',
            lastWorkspace: 'idWks0'
          },
          user2: {
            keepPreviousValues: '',
            id: 'user2',
            name: 'User 2',
            lastWorkspace: ''
          }
        },
        allIds: ['user1', 'user2']
      });
    });
  });

  describe(Users.DISCONNECT_USER_SUCCESS, () => {
    it(`should check action name`, () => {
      expect(Users.DISCONNECT_USER_SUCCESS).toEqual(`[Users] Disconnect user success`);
    });

    const initialState: any = {
      doNotKeepPreviousValues: '',
      isConnecting: false,
      isConnected: true,
      connectionFailed: false,
      connectedUserId: 'user1',
      byId: {
        doNotKeepPreviousValues: '',
        user1: {
          doNotKeepPreviousValues: '',
          id: 'user1',
          name: 'User 1',
          lastWorkspace: 'idWks0'
        },
        user2: {
          doNotKeepPreviousValues: '',
          id: 'user2',
          name: 'User 2',
          lastWorkspace: ''
        }
      },
      allIds: ['user1', 'user2']
    };

    const reducer = Users.reducer(initialState, {
      type: Users.DISCONNECT_USER_SUCCESS,
      payload: { noMatter: 'the payload' }
    });

    it(`should have UI variables set to correct values`, () => {
      expect(reducer.isDisconnecting).toEqual(false);
      expect(reducer.isConnected).toEqual(false);
      expect(reducer.connectedUserId).toEqual('');
    });

    it(`should clean users list`, () => {
      expect(reducer.byId).toEqual({});
      expect(reducer.allIds).toEqual([]);
    });
  });

  describe(Users.DISCONNECT_USER_FAILED, () => {
    it(`should check action name`, () => {
      expect(Users.DISCONNECT_USER_FAILED).toEqual(`[Users] Disconnect user failed`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      isConnecting: false,
      isConnected: true,
      connectionFailed: false,
      connectedUserId: 'user1',
      byId: {
        keepPreviousValues: '',
        user1: {
          keepPreviousValues: '',
          id: 'user1',
          name: 'User 1',
          lastWorkspace: 'idWks0'
        },
        user2: {
          keepPreviousValues: '',
          id: 'user2',
          name: 'User 2',
          lastWorkspace: ''
        }
      },
      allIds: ['user1', 'user2']
    };

    it(`should only toggle isDisconnecting boolean to false without affecting other values`, () => {
      expect(Users.reducer(initialState, {
        type: Users.DISCONNECT_USER_FAILED,
        payload: { noMatter: 'the payload' }
      })).toEqual({
        keepPreviousValues: '',
        isConnecting: false,
        isConnected: true,
        connectionFailed: false,
        isDisconnecting: false,
        connectedUserId: 'user1',
        byId: {
          keepPreviousValues: '',
          user1: {
            keepPreviousValues: '',
            id: 'user1',
            name: 'User 1',
            lastWorkspace: 'idWks0'
          },
          user2: {
            keepPreviousValues: '',
            id: 'user2',
            name: 'User 2',
            lastWorkspace: ''
          }
        },
        allIds: ['user1', 'user2']
      });
    });
  });
});
