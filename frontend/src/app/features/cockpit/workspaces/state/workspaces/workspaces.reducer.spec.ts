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

        isSelectedWorkspaceDeleted: false,
        isSelectedWorkspaceFetched: false,

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
        byId: { keepPreviousValues: '' },
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

    it(`should select the workspace if it's a new one and mark it as not fetched`, () => {
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
          selectedWorkspaceId: 'idWorkspace1',
          isSelectedWorkspaceFetched: false,
          byId: {
            keepPreviousValues: ''
          },
          allIds: []
        });

      expect(Workspaces.reducer(reducer, {
        type: Workspaces.FETCH_WORKSPACE,
        payload: 'idWorkspace2'
      }))
        .toEqual({
          keepPreviousValues: '',
          selectedWorkspaceId: 'idWorkspace2',
          isSelectedWorkspaceFetched: false,
          byId: {
            keepPreviousValues: ''
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
        selectedWorkspaceId: 'idWks1',
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
          ],
          description: 'desc'
        }
      });

      expect(reducer1).toEqual({
        keepPreviousValues: '',
        selectedWorkspaceId: 'idWks1',
        isSelectedWorkspaceFetched: true,
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
            description: 'desc',
            isRemoving: false,
            isFetchingDetails: false,
            isSettingDescription: false
          }
        },
        allIds: ['idWks1']
      });

      const reducer2 = Workspaces.reducer(reducer1, { type: Workspaces.FETCH_WORKSPACE, payload: 'idWks2' });

      const reducer3 = Workspaces.reducer(reducer2, {
        type: Workspaces.FETCH_WORKSPACE_SUCCESS,
        payload: {
          id: 'idWks2',
          name: 'Workspace 2',
          users: ['admin2'],
          description: 'desc',
        }
      });

      expect(reducer3).toEqual({
        keepPreviousValues: '',
        selectedWorkspaceId: 'idWks2',
        isSelectedWorkspaceFetched: true,
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
            description: 'desc',
            isRemoving: false,
            isFetchingDetails: false,
            isSettingDescription: false
          },
          idWks2: {
            id: 'idWks2',
            name: 'Workspace 2',
            users: ['admin2'],
            description: 'desc',
            isRemoving: false,
            isFetchingDetails: false,
            isSettingDescription: false
          }
        },
        allIds: ['idWks1', 'idWks2']
      });
    });

    it(`should update the workspace if it's an existing one with correct variables and initial values`, () => {
      const initialState: any = {
        keepPreviousValues: '',
        selectedWorkspaceId: 'idWks1',
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
          users: ['admin2', 'admin3'],
          description: 'desc'
        }
      });

      expect(reducer).toEqual({
        keepPreviousValues: '',
        selectedWorkspaceId: 'idWks1',
        isSelectedWorkspaceFetched: true,
        byId: {
          keepPreviousValues: '',
          idWks1: {
            keepPreviousValues: '',
            id: 'idWks1',
            name: 'Workspace 1 updated name',
            users: ['admin2', 'admin3'],
            description: 'desc',
            isRemoving: false,
            isFetchingDetails: false,
            isSettingDescription: false
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

  describe(type(Workspaces.FETCH_WORKSPACE_DETAILS), () => {
    it(`should check action name`, () => {
      expect(Workspaces.FETCH_WORKSPACE_DETAILS).toEqual(`WORKSPACES_REDUCER_FETCH_WORKSPACE_DETAILS`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idWks1: {
          keepPreviousValues: '',
        }
      },
      allIds: ['idWks1']
    };

    it(`should set isFetchingDetails to true even if isFetchingDetails doesn't exists yet`, () => {
      expect(Workspaces.reducer(initialState, {
        type: Workspaces.FETCH_WORKSPACE_DETAILS,
        payload: 'idWks1'
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idWks1: {
            keepPreviousValues: '',
            isFetchingDetails: true
          },
        },
        allIds: ['idWks1']
      });
    });

    it(`should add the workspace if it doesn't exists yet`, () => {
      expect(Workspaces.reducer(initialState, {
        type: Workspaces.FETCH_WORKSPACE_DETAILS,
        payload: 'idWks2'
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idWks1: {
            keepPreviousValues: ''
          },
          idWks2: { isFetchingDetails: true }
        },
        allIds: ['idWks1', 'idWks2']
      });
    });
  });

  describe(type(Workspaces.FETCH_WORKSPACE_DETAILS_SUCCESS), () => {
    it(`should check action name`, () => {
      expect(Workspaces.FETCH_WORKSPACE_DETAILS_SUCCESS).toEqual(`WORKSPACES_REDUCER_FETCH_WORKSPACE_DETAILS_SUCCESS`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idWks1: {
          keepPreviousValues: '',
        }
      },
      allIds: ['idWks1']
    };

    it(`should set isFetchingDetails to false even if isFetchingDetails doesn't exists yet`, () => {
      expect(Workspaces.reducer(initialState, {
        type: Workspaces.FETCH_WORKSPACE_DETAILS_SUCCESS,
        payload: { id: 'idWks1', data: { someData: 'some data' } }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idWks1: {
            keepPreviousValues: '',
            isFetchingDetails: false,
            someData: 'some data'
          }
        },
        allIds: ['idWks1']
      });
    });

    it(`should add the workspace if it doesn't exists yet`, () => {
      expect(Workspaces.reducer(initialState, {
        type: Workspaces.FETCH_WORKSPACE_DETAILS_SUCCESS,
        payload: { id: 'idWks2', data: { someData: 'some data' } }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idWks1: {
            keepPreviousValues: ''
          },
          idWks2: {
            someData: 'some data',
            isFetchingDetails: false
          }
        },
        allIds: ['idWks1', 'idWks2']
      });
    });
  });

  describe(type(Workspaces.FETCH_WORKSPACE_DETAILS_FAILED), () => {
    it(`should check action name`, () => {
      expect(Workspaces.FETCH_WORKSPACE_DETAILS_FAILED).toEqual(`WORKSPACES_REDUCER_FETCH_WORKSPACE_DETAILS_FAILED`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idWks1: {
          keepPreviousValues: '',
          isFetchingDetails: true
        }
      },
      allIds: ['idWks1']
    };

    it(`should set isFetchingDetails to false if the workspace exists`, () => {
      expect(Workspaces.reducer(initialState, {
        type: Workspaces.FETCH_WORKSPACE_DETAILS_FAILED,
        payload: 'idWks1'
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idWks1: {
            keepPreviousValues: '',
            isFetchingDetails: false
          }
        },
        allIds: ['idWks1']
      });
    });

    it(`should return the same object if ID is unknown`, () => {
      expect(Workspaces.reducer(initialState, {
        type: Workspaces.FETCH_WORKSPACE_DETAILS_FAILED,
        payload: 'idWks2'
      })).toBe(initialState);
    });
  });

  describe(type(Workspaces.SET_DESCRIPTION), () => {
    it(`should check action name`, () => {
      expect(Workspaces.SET_DESCRIPTION).toEqual(`WORKSPACES_REDUCER_SET_DESCRIPTION`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idWks1: {
          keepPreviousValues: '',
        }
      },
      allIds: ['idWks1']
    };

    it(`should set isSettingDescription to true even if isSettingDescription doesn't exists yet`, () => {
      expect(Workspaces.reducer(initialState, {
        type: Workspaces.SET_DESCRIPTION,
        payload: { id: 'idWks1', description: 'desc' }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idWks1: {
            keepPreviousValues: '',
            isSettingDescription: true
          },
        },
        allIds: ['idWks1']
      });
    });

    it(`should add the workspace if it doesn't exists yet`, () => {
      expect(Workspaces.reducer(initialState, {
        type: Workspaces.SET_DESCRIPTION,
        payload: { id: 'idWks2', description: 'desc' }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idWks1: {
            keepPreviousValues: ''
          },
          idWks2: { isSettingDescription: true }
        },
        allIds: ['idWks1', 'idWks2']
      });
    });
  });

  describe(type(Workspaces.SET_DESCRIPTION_SUCCESS), () => {
    it(`should check action name`, () => {
      expect(Workspaces.SET_DESCRIPTION_SUCCESS).toEqual(`WORKSPACES_REDUCER_SET_DESCRIPTION_SUCCESS`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idWks1: {
          keepPreviousValues: '',
        }
      },
      allIds: ['idWks1']
    };

    it(`should set isSettingDescription to false even if isSettingDescription doesn't exists yet`, () => {
      expect(Workspaces.reducer(initialState, {
        type: Workspaces.SET_DESCRIPTION_SUCCESS,
        payload: { id: 'idWks1', description: 'desc' }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idWks1: {
            keepPreviousValues: '',
            isSettingDescription: false,
            description: 'desc'
          }
        },
        allIds: ['idWks1']
      });
    });

    it(`should add the workspace if it doesn't exists yet`, () => {
      expect(Workspaces.reducer(initialState, {
        type: Workspaces.SET_DESCRIPTION_SUCCESS,
        payload: { id: 'idWks2', description: 'desc' }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idWks1: {
            keepPreviousValues: ''
          },
          idWks2: {
            description: 'desc',
            isSettingDescription: false
          }
        },
        allIds: ['idWks1', 'idWks2']
      });
    });
  });

  describe(type(Workspaces.SET_DESCRIPTION_FAILED), () => {
    it(`should check action name`, () => {
      expect(Workspaces.SET_DESCRIPTION_FAILED).toEqual(`WORKSPACES_REDUCER_SET_DESCRIPTION_FAILED`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idWks1: {
          keepPreviousValues: '',
          isSettingDescription: true
        }
      },
      allIds: ['idWks1']
    };

    it(`should set isSettingDescription to false if the workspace exists`, () => {
      expect(Workspaces.reducer(initialState, {
        type: Workspaces.SET_DESCRIPTION_FAILED,
        payload: 'idWks1'
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idWks1: {
            keepPreviousValues: '',
            isSettingDescription: false
          }
        },
        allIds: ['idWks1']
      });
    });

    it(`should return the same object if ID is unknown`, () => {
      expect(Workspaces.reducer(initialState, {
        type: Workspaces.SET_DESCRIPTION_FAILED,
        payload: 'idWks2'
      })).toBe(initialState);
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
      selectedWorkspaceId: 'idWks1',
      byId: {
        keepPreviousValues: '',
        idWks1: {
          keepPreviousValues: '',
          isRemoving: false
        }
      },
      allIds: ['idWks1']
    };

    it(`should set the isSelectedWorkspaceRemoving variable to true`, () => {
      expect(Workspaces.reducer(initialState, {
        type: Workspaces.DELETE_WORKSPACE,
        payload: 'idWks1'
      })).toEqual({
        keepPreviousValues: '',
        selectedWorkspaceId: 'idWks1',
        byId: {
          keepPreviousValues: '',
          idWks1: {
            keepPreviousValues: '',
            isRemoving: true
          }
        },
        allIds: ['idWks1']
      });
    });
  });

  describe(type(Workspaces.DELETE_WORKSPACE_SUCCESS), () => {
    it(`should check action name`, () => {
      expect(Workspaces.DELETE_WORKSPACE_SUCCESS).toEqual(`WORKSPACES_REDUCER_DELETE_WORKSPACE_SUCCESS`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      selectedWorkspaceId: 'idWks1',
      isSelectedWorkspaceDeleted: false
    };

    it(`should set the isSelectedWorkspaceDeleted variable to true`, () => {
      expect(Workspaces.reducer(initialState, {
        type: Workspaces.DELETE_WORKSPACE_SUCCESS,
        payload: 'idWks1'
      })).toEqual({
        keepPreviousValues: '',
        selectedWorkspaceId: 'idWks1',
        isSelectedWorkspaceDeleted: true
      });
    });

    it(`should not set the isSelectedWorkspaceDeleted variable if we are on another workspace`, () => {
      expect(Workspaces.reducer(initialState, {
        type: Workspaces.DELETE_WORKSPACE_SUCCESS,
        payload: 'idWks2'
      })).toEqual({
        keepPreviousValues: '',
        selectedWorkspaceId: 'idWks1',
        isSelectedWorkspaceDeleted: false
      });
    });
  });

  describe(type(Workspaces.DELETE_WORKSPACE_FAILED), () => {
    it(`should check action name`, () => {
      expect(Workspaces.DELETE_WORKSPACE_FAILED).toEqual(`WORKSPACES_REDUCER_DELETE_WORKSPACE_FAILED`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      selectedWorkspaceId: 'idWks1',
      byId: {
        keepPreviousValues: '',
        idWks1: {
          keepPreviousValues: '',
          isRemoving: true
        }
      },
      allIds: ['idWks1']
    };

    it(`should set the isSelectedWorkspaceRemoving variable to false`, () => {
      expect(Workspaces.reducer(initialState, {
        type: Workspaces.DELETE_WORKSPACE_FAILED,
        payload: 'idWks1'
      })).toEqual({
        keepPreviousValues: '',
        selectedWorkspaceId: 'idWks1',
        byId: {
          keepPreviousValues: '',
          idWks1: {
            keepPreviousValues: '',
            isRemoving: false
          }
        },
        allIds: ['idWks1']
      });
    });
  });

  describe(type(Workspaces.REMOVE_WORKSPACE), () => {
    it(`should check action name`, () => {
      expect(Workspaces.REMOVE_WORKSPACE).toEqual(`WORKSPACES_REDUCER_REMOVE_WORKSPACE`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      selectedWorkspaceId: 'idWks1',
      isSelectedWorkspaceDeleted: false
    };

    it('should set the deletedWorkspace to true', () => {
      expect(Workspaces.reducer(initialState, {
        type: Workspaces.REMOVE_WORKSPACE,
        payload: 'idWks1'
      })).toEqual({
        keepPreviousValues: '',
        selectedWorkspaceId: 'idWks1',
        isSelectedWorkspaceDeleted: true
      });
    });

    it('should not set the deletedWorkspace to true if we are on another workspace', () => {
      expect(Workspaces.reducer(initialState, {
        type: Workspaces.REMOVE_WORKSPACE,
        payload: 'idWks2'
      })).toEqual({
        keepPreviousValues: '',
        selectedWorkspaceId: 'idWks1',
        isSelectedWorkspaceDeleted: false
      });
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
          idWks1: { keepPreviousValues: '' },
          idWks2: { keepPreviousValues: '' }
        },
        allIds: ['idWks1', 'idWks2'],
        selectedWorkspaceId: 'idWks1'
      };

      expect(Workspaces.reducer(initialState, {
        type: Workspaces.CLOSE_WORKSPACE,
        payload: { delete: true }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idWks2: { keepPreviousValues: '' }
        },
        allIds: ['idWks2'],
        selectedWorkspaceId: '',
        isSelectedWorkspaceDeleted: false
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
