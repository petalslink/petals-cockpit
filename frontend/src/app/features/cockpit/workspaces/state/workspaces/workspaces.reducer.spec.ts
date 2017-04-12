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

import { Workspaces } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.reducer';
import { type, emptyJavascriptMap } from 'app/shared/helpers/shared.helper';
import { Users } from 'app/shared/state/users.reducer';
import { workspacesTableFactory } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.initial-state';

describe(`Workspaces reducer`, () => {
  it(`should have a default value`, () => {
    expect(Workspaces.reducer(undefined, { type: `init`, payload: `` }))
      .toEqual({
        selectedWorkspaceId: '',

        isAddingWorkspace: false,
        isFetchingWorkspaces: false,
        searchPetals: '',

        isRemovingWorkspace: false,
        deletedWorkspace: false,

        byId: {},
        allIds: []
      });
  });

  describe(type(Workspaces.FETCH_WORKSPACES), () => {
    it(`should check action name`, () => {
      expect(Workspaces.FETCH_WORKSPACES).toEqual(`WORKSPACES_REDUCER_FETCH_WORKSPACES`);
    });

    it(`should set the isFetchingWorkspaces variable to true`, () => {
      const initialState: any = {
        keepPreviousValues: '',
        isFetchingWorkspaces: false
      };

      expect(Workspaces.reducer(initialState, {
        type: Workspaces.FETCH_WORKSPACES,
      })).toEqual({
        keepPreviousValues: '',
        isFetchingWorkspaces: true
      });
    });
  });

  describe(type(Workspaces.FETCH_WORKSPACES_SUCCESS), () => {
    it(`should check action name`, () => {
      expect(Workspaces.FETCH_WORKSPACES_SUCCESS).toEqual(`WORKSPACES_REDUCER_FETCH_WORKSPACES_SUCCESS`);
    });

    it(`should set the isFetchingWorkspaces variable to false`, () => {
      const initialState: any = {
        ...emptyJavascriptMap(),
        keepPreviousValues: '',
        isFetchingWorkspaces: true
      };

      expect(Workspaces.reducer(initialState, {
        type: Workspaces.FETCH_WORKSPACES_SUCCESS,
        payload: emptyJavascriptMap()
      })).toEqual({
        ...emptyJavascriptMap(),
        keepPreviousValues: '',
        isFetchingWorkspaces: false
      });
    });

    it(`should add the payload`, () => {
      const initialState: any = {
        ...emptyJavascriptMap(),
        keepPreviousValues: '',
        isFetchingWorkspaces: true
      };

      expect(Workspaces.reducer(initialState, {
        type: Workspaces.FETCH_WORKSPACES_SUCCESS,
        payload: {
          byId: {
            idWks0: {
              id: 'idWks0',
              name: 'Workspace 0',
              users: [
                'admin'
              ]
            },
            idWks1: {
              id: 'idWks1',
              name: 'Workspace 1',
              users: [
                'admin',
                'bescudie',
                'mrobert',
                'cchevalier',
                'vnoel'
              ]
            }
          },
          allIds: [
            'idWks0',
            'idWks1'
          ]
        }
      })).toEqual({
        keepPreviousValues: '',
        isFetchingWorkspaces: false,
        byId: {
          idWks0: {
            id: 'idWks0',
            name: 'Workspace 0',
            users: [
              'admin'
            ]
          },
          idWks1: {
            id: 'idWks1',
            name: 'Workspace 1',
            users: [
              'admin',
              'bescudie',
              'mrobert',
              'cchevalier',
              'vnoel'
            ]
          }
        },
        allIds: [
          'idWks0',
          'idWks1'
        ]
      });
    });
  });

  describe(type(Workspaces.FETCH_WORKSPACES_FAILED), () => {
    it(`should check action name`, () => {
      expect(Workspaces.FETCH_WORKSPACES_FAILED).toEqual(`WORKSPACES_REDUCER_FETCH_WORKSPACES_FAILED`);
    });

    it(`should set the isFetchingWorkspaces variable to false`, () => {
      const initialState: any = {
        keepPreviousValues: '',
        isFetchingWorkspaces: true
      };

      expect(Workspaces.reducer(initialState, {
        type: Workspaces.FETCH_WORKSPACES_FAILED,
      })).toEqual({
        keepPreviousValues: '',
        isFetchingWorkspaces: false
      });
    });
  });

  describe(type(Workspaces.POST_WORKSPACE), () => {
    it(`should check action name`, () => {
      expect(Workspaces.POST_WORKSPACE).toEqual(`WORKSPACES_REDUCER_POST_WORKSPACE`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      isAddingWorkspace: false
    };

    it(`should set the isAddingWorkspace variable to true`, () => {
      expect(Workspaces.reducer(initialState, {
        type: Workspaces.POST_WORKSPACE,
      })).toEqual({
        keepPreviousValues: '',
        isAddingWorkspace: true
      });
    });
  });

  describe(type(Workspaces.POST_WORKSPACE_SUCCESS), () => {
    it(`should check action name`, () => {
      expect(Workspaces.POST_WORKSPACE_SUCCESS).toEqual(`WORKSPACES_REDUCER_POST_WORKSPACE_SUCCESS`);
    });

    it(`should add a workspace if it's a new one`, () => {
      const initialState: any = {
        keepPreviousValues: '',
        isAddingWorkspace: true,
        byId: { keepPreviousValues: ''},
        allIds: []
      };

      const reducer = Workspaces.reducer(initialState, {
        type: Workspaces.POST_WORKSPACE_SUCCESS,
        payload: {
          id: 'idWorkspace1',
          name: 'Workspace 1',
          users: [
            'idUser1',
            'idUser2',
            'idUser3'
          ]
        }
      });

      expect(reducer)
        .toEqual({
          keepPreviousValues: '',
          isAddingWorkspace: false,
          byId: {
            keepPreviousValues: '',
            idWorkspace1: {
              id: 'idWorkspace1',
              name: 'Workspace 1',
              users: [
                'idUser1',
                'idUser2',
                'idUser3'
              ]
            }
          },
          allIds: ['idWorkspace1']
        });

      expect(Workspaces.reducer(reducer, {
        type: Workspaces.POST_WORKSPACE_SUCCESS,
        payload: {
          id: 'idWorkspace2',
          name: 'Workspace 2',
          users: [
            'idUser4',
            'idUser5',
            'idUser6'
          ]
        }
      }))
        .toEqual({
          keepPreviousValues: '',
          isAddingWorkspace: false,
          byId: {
            keepPreviousValues: '',
            idWorkspace1: {
              id: 'idWorkspace1',
              name: 'Workspace 1',
              users: [
                'idUser1',
                'idUser2',
                'idUser3'
              ]
            },
            idWorkspace2: {
              id: 'idWorkspace2',
              name: 'Workspace 2',
              users: [
                'idUser4',
                'idUser5',
                'idUser6'
              ]
            }
          },
          allIds: ['idWorkspace1', 'idWorkspace2']
        });
    });

    it(`should update a workspace if it's an existing one`, () => {
      const initialState: any = {
        keepPreviousValues: '',
        isAddingWorkspace: true,
        byId: {
          keepPreviousValues: '',
          idWorkspace1: {
            keepPreviousValues: '',
            id: 'idWorkspace1',
            name: 'Workspace 1',
            users: [
              'idUser1',
              'idUser2',
              'idUser3'
            ]
          }
        },
        allIds: ['idWorkspace1']
      };

      const reducer = Workspaces.reducer(initialState, {
        type: Workspaces.POST_WORKSPACE_SUCCESS,
        payload: {
          id: 'idWorkspace1',
          name: 'Workspace 1 new name',
          users: [
            'idUser1',
            'idUser2',
            'idUser3',
            'idUser4',
            'idUser5'
          ]
        }
      });

      expect(reducer).toEqual({
        keepPreviousValues: '',
        isAddingWorkspace: false,
        byId: {
          keepPreviousValues: '',
          idWorkspace1: {
            keepPreviousValues: '',
            id: 'idWorkspace1',
            name: 'Workspace 1 new name',
            users: [
              'idUser1',
              'idUser2',
              'idUser3',
              'idUser4',
              'idUser5'
            ]
          }
        },
        allIds: ['idWorkspace1']
      });
    });
  });

  describe(type(Workspaces.POST_WORKSPACE_FAILED), () => {
    it(`should check action name`, () => {
      expect(Workspaces.POST_WORKSPACE_FAILED).toEqual(`WORKSPACES_REDUCER_POST_WORKSPACE_FAILED`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      isAddingWorkspace: true
    };

    it(`should set the isAddingWorkspace variable to false`, () => {
      expect(Workspaces.reducer(initialState, {
        type: Workspaces.POST_WORKSPACE_FAILED,
      })).toEqual({
        keepPreviousValues: '',
        isAddingWorkspace: false
      });
    });
  });

  describe(type(Workspaces.FETCH_WORKSPACE), () => {
    it(`should check action name`, () => {
      expect(Workspaces.FETCH_WORKSPACE).toEqual(`WORKSPACES_REDUCER_FETCH_WORKSPACE`);
    });

    it(`should add a workspace if it's a new one`, () => {
      const initialState: any = {
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
        },
        allIds: []
      };

      const reducer = Workspaces.reducer(initialState, {
        type: Workspaces.FETCH_WORKSPACE,
        payload: 'idWorkspace1'
      });

      expect(reducer)
        .toEqual({
          keepPreviousValues: '',
          byId: {
            keepPreviousValues: '',
            idWorkspace1: {
              isFetched: false
            }
          },
          // shouldn't be added to allIds as this workspace is not usable yet
          allIds: []
        });

      expect(Workspaces.reducer(reducer, {
        type: Workspaces.FETCH_WORKSPACE,
        payload: 'idWorkspace2'
      }))
        .toEqual({
          keepPreviousValues: '',
          byId: {
            keepPreviousValues: '',
            idWorkspace1: {
              isFetched: false
            },
            idWorkspace2: {
              isFetched: false
            }
          },
          allIds: []
        });
    });

    it(`should update the isFetched variable to true of a workspace if it's an existing one`, () => {
      const initialState: any = {
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idWorkspace1: {
            keepPreviousValues: '',
            isFetched: false
          },
          idWorkspace2: {
            keepPreviousValues: '',
            isFetched: false
          }
        },
        allIds: []
      };

      const reducer = Workspaces.reducer(initialState, {
        type: Workspaces.FETCH_WORKSPACE,
        payload: 'idWorkspace1'
      });

      expect(reducer).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idWorkspace1: {
            keepPreviousValues: '',
            isFetched: false
          },
          idWorkspace2: {
            keepPreviousValues: '',
            isFetched: false
          }
        },
        allIds: []
      });
    });
  });

  describe(type(Workspaces.FETCH_WORKSPACE_SUCCESS), () => {
    it(`should check action name`, () => {
      expect(Workspaces.FETCH_WORKSPACE_SUCCESS).toEqual(`WORKSPACES_REDUCER_FETCH_WORKSPACE_SUCCESS`);
    });

    it(`should add a workspace if it's a new one (also in allIds variable) and set correct variables`, () => {
      const initialState: any = {
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: ''
        },
        allIds: []
      };

      const reducer1 = Workspaces.reducer(initialState, {
        type: Workspaces.FETCH_WORKSPACE_SUCCESS,
        payload: {
          id: 'idWks1',
          name: 'Workspace 1',
          users: [
            'admin',
            'bescudie',
            'mrobert',
            'cchevalier',
            'vnoel'
          ]
        }
      });

      expect(reducer1).toEqual({
        keepPreviousValues: '',
        selectedWorkspaceId: 'idWks1',
        byId: {
          keepPreviousValues: '',
          idWks1: {
            id: 'idWks1',
            name: 'Workspace 1',
            users: [
              'admin',
              'bescudie',
              'mrobert',
              'cchevalier',
              'vnoel'
            ],
            isFetched: true
          }
        },
        allIds: ['idWks1']
      });

      const reducer2 = Workspaces.reducer(reducer1, {
        type: Workspaces.FETCH_WORKSPACE_SUCCESS,
        payload: {
          id: 'idWks2',
          name: 'Workspace 2',
          users: ['admin2']
        }
      });

      expect(reducer2).toEqual({
        keepPreviousValues: '',
        selectedWorkspaceId: 'idWks2',
        byId: {
          keepPreviousValues: '',
          idWks1: {
            id: 'idWks1',
            name: 'Workspace 1',
            users: [
              'admin',
              'bescudie',
              'mrobert',
              'cchevalier',
              'vnoel'
            ],
            isFetched: true
          },
          idWks2: {
            id: 'idWks2',
            name: 'Workspace 2',
            users: ['admin2'],
            isFetched: true
          }
        },
        allIds: ['idWks1', 'idWks2']
      });
    });

    it(`should update the workspace if it's an existing one with correct variables`, () => {
      const initialState: any = {
        keepPreviousValues: '',
        selectedWorkspaceId: 'idWks2',
        byId: {
          keepPreviousValues: '',
          idWks1: {
            keepPreviousValues: '',
            id: 'idWks1',
            name: 'Workspace 1',
            users: [
              'admin',
              'bescudie',
              'mrobert',
              'cchevalier',
              'vnoel'
            ]
          },
          idWks2: {
            keepPreviousValues: '',
            id: 'idWks2',
            name: 'Workspace 2',
            users: ['admin2']
          }
        },
        allIds: ['idWks1', 'idWks2']
      };

      const reducer = Workspaces.reducer(initialState, {
        type: Workspaces.FETCH_WORKSPACE_SUCCESS,
        payload: {
          id: 'idWks1',
          name: 'Workspace 1 updated name',
          users: ['admin2', 'admin3']
        }
      });

      expect(reducer).toEqual({
        keepPreviousValues: '',
        selectedWorkspaceId: 'idWks1',
        byId: {
          keepPreviousValues: '',
          idWks1: {
            keepPreviousValues: '',
            id: 'idWks1',
            name: 'Workspace 1 updated name',
            users: ['admin2', 'admin3'],
            isFetched: true
          },
          idWks2: {
            keepPreviousValues: '',
            id: 'idWks2',
            name: 'Workspace 2',
            users: ['admin2']
          }
        },
        allIds: ['idWks1', 'idWks2']
      });
    });
  });

  describe(type(Workspaces.SET_SEARCH), () => {
    it(`should check action name`, () => {
      expect(Workspaces.SET_SEARCH).toEqual(`WORKSPACES_REDUCER_SET_SEARCH`);
    });

    it(`should set the searchPetals variable`, () => {
      expect(Workspaces.reducer(<any>{ searchPetals: '' }, {
        type: Workspaces.SET_SEARCH,
        payload: 'New search'
      })).toEqual({
        searchPetals: 'New search'
      });
    });

    it(`should trim the search before saving it`, () => {
      expect(Workspaces.reducer(<any>{ searchPetals: '' }, {
        type: Workspaces.SET_SEARCH,
        payload: '  New search  '
      })).toEqual({
        searchPetals: 'New search'
      });
    });
  });

  describe(type(Workspaces.DELETE_WORKSPACE), () => {
    it(`should check action name`, () => {
      expect(Workspaces.DELETE_WORKSPACE).toEqual(`WORKSPACES_REDUCER_DELETE_WORKSPACE`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      isRemovingWorkspace: false
    };

    it(`should set the isRemovingWorkspace variable to true`, () => {
      expect(Workspaces.reducer(initialState, {
        type: Workspaces.DELETE_WORKSPACE,
      })).toEqual({
        keepPreviousValues: '',
        isRemovingWorkspace: true
      });
    });
  });

  describe(type(Workspaces.DELETE_WORKSPACE_SUCCESS), () => {
    it(`should check action name`, () => {
      expect(Workspaces.DELETE_WORKSPACE_SUCCESS).toEqual(`WORKSPACES_REDUCER_DELETE_WORKSPACE_SUCCESS`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      deletedWorkspace: false
    };

    it(`should set the deletedWorkspace variable to true`, () => {
      expect(Workspaces.reducer(initialState, {
        type: Workspaces.DELETE_WORKSPACE_SUCCESS,
      })).toEqual({
        keepPreviousValues: '',
        deletedWorkspace: true
      });
    });
  });

  describe(type(Workspaces.DELETE_WORKSPACE_FAILED), () => {
    it(`should check action name`, () => {
      expect(Workspaces.DELETE_WORKSPACE_FAILED).toEqual(`WORKSPACES_REDUCER_DELETE_WORKSPACE_FAILED`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      isRemovingWorkspace: true
    };

    it(`should set the isRemovingWorkspace variable to false`, () => {
      expect(Workspaces.reducer(initialState, {
        type: Workspaces.DELETE_WORKSPACE_FAILED,
      })).toEqual({
        keepPreviousValues: '',
        isRemovingWorkspace: false
      });
    });
  });

  describe(type(Workspaces.REMOVE_WORKSPACE), () => {
    it(`should check action name`, () => {
      expect(Workspaces.REMOVE_WORKSPACE).toEqual(`WORKSPACES_REDUCER_REMOVE_WORKSPACE`);
    });

    xit('TODO', () => {

    });
  });

  describe(type(Workspaces.CLEAN_WORKSPACE), () => {
    it(`should check action name`, () => {
      expect(Workspaces.CLEAN_WORKSPACE).toEqual(`WORKSPACES_REDUCER_CLEAN_WORKSPACE`);
    });
  });

  describe(type(Workspaces.CLOSE_WORKSPACE), () => {
    it(`should check action name`, () => {
      expect(Workspaces.CLOSE_WORKSPACE).toEqual(`WORKSPACES_REDUCER_CLOSE_WORKSPACE`);
    });

    it(`should close the workspace only if there's a workspace selected and a truthy payload.delete`, () => {
      const initialState: any = {
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idWks1: { keepPreviousValues: ''},
          idWks2: { keepPreviousValues: ''}
        },
        allIds: ['idWks1', 'idWks2'],
        selectedWorkspaceId: 'idWks1',
        deletedWorkspace: null,
        isRemovingWorkspace: null
      };

      expect(Workspaces.reducer(initialState, {
        type: Workspaces.CLOSE_WORKSPACE,
        payload: { delete: true }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idWks2: { keepPreviousValues: ''}
        },
        allIds: ['idWks2'],
        selectedWorkspaceId: '',
        deletedWorkspace: false,
        isRemovingWorkspace: false
      });
    });

    it(`should just set the current workspace to empty if there's a workspace already selected or if payload.delete is falsy`, () => {
      expect(Workspaces.reducer(<any>{
        keepPreviousValues: '',
        selectedWorkspaceId: 'idWks1'
      }, {
          type: Workspaces.CLOSE_WORKSPACE
        }))
        .toEqual({
          keepPreviousValues: '',
          selectedWorkspaceId: ''
        });

      expect(Workspaces.reducer(<any>{
        keepPreviousValues: '',
        selectedWorkspaceId: ''
      }, {
          type: Workspaces.CLOSE_WORKSPACE
        }))
        .toEqual({
          keepPreviousValues: '',
          selectedWorkspaceId: ''
        });

      expect(Workspaces.reducer(<any>{
        keepPreviousValues: '',
        selectedWorkspaceId: 'idWks1'
      }, {
          type: Workspaces.CLOSE_WORKSPACE,
          payload: { delete: false }
        }))
        .toEqual({
          keepPreviousValues: '',
          selectedWorkspaceId: ''
        });
    });
  });

  describe(type(Users.DISCONNECT_USER_SUCCESS), () => {
    it(`should return the initial value of the reducer`, () => {
      expect(Workspaces.reducer(<any>{}, {
        type: Users.DISCONNECT_USER_SUCCESS
      })).toEqual(workspacesTableFactory());
    });
  });
});
