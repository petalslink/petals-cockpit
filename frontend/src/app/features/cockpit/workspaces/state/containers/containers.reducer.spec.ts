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

import { Containers } from 'app/features/cockpit/workspaces/state/containers/containers.reducer';
import { Components } from 'app/features/cockpit/workspaces/state/components/components.reducer';
import { Workspaces } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.reducer';
import { containersTableFactory } from 'app/features/cockpit/workspaces/state/containers/containers.interface';

describe(`Containers reducer`, () => {
  it(`should have a default value`, () => {
    expect(Containers.reducer(undefined, { type: `init`, payload: `` }))
      .toEqual({
        selectedContainerId: '',
        isFetchingDetails: false,

        byId: {},
        allIds: []
      });
  });

  describe(Containers.FETCH_CONTAINERS_SUCCESS, () => {
    it(`should check action name`, () => {
      expect(Containers.FETCH_CONTAINERS_SUCCESS).toEqual(`[Containers] Fetch containers success`);
    });

    const payload = {
      byId: {
        idCont2: {
          name: 'Cont 2',
          components: [
            'idComp4',
            'idComp5'
          ],
          id: 'idCont2'
        },
        idCont3: {
          name: 'Cont 3',
          components: [
            'idComp6',
            'idComp7'
          ],
          id: 'idCont3'
        }
      },
      allIds: [
        'idCont2',
        'idCont3'
      ]
    };

    it(`should add reachabilities array on every container`, () => {
      const initialState: any = {
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idCont1: { keepPreviousValues: '', reachabilities: [] }
        },
        allIds: ['idCont1']
      };

      const reducer = Containers.reducer(initialState, {
        type: Containers.FETCH_CONTAINERS_SUCCESS,
        payload
      });

      expect(reducer.byId.idCont2.reachabilities).toEqual([]);
      expect(reducer.byId.idCont3.reachabilities).toEqual([]);
    });

    it(`should keep previous containers and update them`, () => {
      const initialState: any = {
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idCont1: { keepPreviousValues: '', reachabilities: [] },
          idCont2: {
            name: 'Cont 2 old name',
            components: [
              'idComp4 old',
              'idComp5 old',
              'thisComponentIdShouldBeRemoved'
            ],
            id: 'idCont2'
          },
        },
        allIds: ['idCont1']
      };

      expect(Containers.reducer(initialState, {
        type: Containers.FETCH_CONTAINERS_SUCCESS,
        payload
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idCont1: { keepPreviousValues: '', reachabilities: [] },
          idCont2: {
            name: 'Cont 2',
            components: [
              'idComp4',
              'idComp5'
            ],
            id: 'idCont2',
            reachabilities: [],
            isFolded: false,
            isFetchingDetails: false,
            isDeployingComponent: false,
          },
          idCont3: {
            name: 'Cont 3',
            components: [
              'idComp6',
              'idComp7'
            ],
            id: 'idCont3',
            reachabilities: [],
            isFolded: false,
            isFetchingDetails: false,
            isDeployingComponent: false,
          }
        },
        allIds: [
          'idCont1',
          'idCont2',
          'idCont3'
        ]
      });
    });
  });

  describe(Containers.FOLD_CONTAINER, () => {
    it(`should check action name`, () => {
      expect(Containers.FOLD_CONTAINER).toEqual(`[Containers] Fold container`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      selectedContainerId: '',
      byId: {
        keepPreviousValues: '',
        idCont0: {
          keepPreviousValues: '',
          isFolded: false
        }
      },
      allIds: ['idCont0']
    };

    it(`should return the same object if ID doesn't exists`, () => {
      const reducer = Containers.reducer(initialState, {
        type: Containers.FOLD_CONTAINER,
        payload: { containerId: 'unknown' }
      });

      expect(reducer).toBe(initialState);
    });

    it(`should fold an existing container`, () => {
      const reducer = Containers.reducer(initialState, {
        type: Containers.FOLD_CONTAINER,
        payload: { containerId: 'idCont0' }
      });

      expect(reducer).toEqual({
        selectedContainerId: '',
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idCont0: {
            keepPreviousValues: '',
            isFolded: true
          }
        },
        allIds: ['idCont0']
      });
    });

    it(`should return the same object when trying to fold a container already folded`, () => {
      const initialState2: any = {
        selectedContainerId: '',
        byId: {
          idCont0: { isFolded: true }
        },
        allIds: ['idCont0']
      };

      const reducer = Containers.reducer(initialState2, {
        type: Containers.FOLD_CONTAINER,
        payload: { containerId: 'idCont0' }
      });

      expect(reducer).toBe(initialState2);
    });
  });

  describe(Containers.UNFOLD_CONTAINER, () => {
    it(`should check action name`, () => {
      expect(Containers.UNFOLD_CONTAINER).toEqual(`[Containers] Unfold container`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      selectedContainerId: '',
      byId: {
        keepPreviousValues: '',
        idCont0: {
          keepPreviousValues: '',
          isFolded: false
        }
      },
      allIds: ['idCont0']
    };

    it(`should return the same object when trying to unfold an unknown container`, () => {
      const reducer = Containers.reducer(initialState, {
        type: Containers.UNFOLD_CONTAINER,
        payload: { containerId: 'unknown' }
      });

      expect(reducer).toBe(initialState);
    });

    it(`should unfold an existing container`, () => {
      const reducer = Containers.reducer(initialState, {
        type: Containers.UNFOLD_CONTAINER,
        payload: { containerId: 'idCont0' }
      });

      expect(reducer).toEqual({
        keepPreviousValues: '',
        selectedContainerId: '',
        byId: {
          keepPreviousValues: '',
          idCont0: {
            keepPreviousValues: '',
            isFolded: false
          }
        },
        allIds: ['idCont0']
      });
    });

    it(`should return the same object when trying to unfold an already unfolded container`, () => {
      const initialState2: any = {
        selectedContainerId: '',
        byId: {
          idCont0: { isFolded: false }
        },
        allIds: ['idCont0']
      };

      const reducer = Containers.reducer(initialState2, {
        type: Containers.UNFOLD_CONTAINER,
        payload: { containerId: 'idCont0' }
      });

      expect(reducer).toBe(initialState2);
    });
  });

  describe(Containers.TOGGLE_FOLD_CONTAINER, () => {
    it(`should check action name`, () => {
      expect(Containers.TOGGLE_FOLD_CONTAINER).toEqual(`[Containers] Toggle fold container`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      selectedContainerId: '',
      byId: {
        keepPreviousValues: '',
        idCont0: {
          keepPreviousValues: '',
          isFolded: true
        }
      },
      allIds: ['idCont0']
    };

    it(`should return the same object when trying to toggle an unknown ID`, () => {
      const reducer = Containers.reducer(initialState, {
        type: Containers.TOGGLE_FOLD_CONTAINER,
        payload: { containerId: 'unknown' }
      });

      expect(reducer).toBe(initialState);
    });

    it(`should toggle from true to false`, () => {
      const reducer2 = Containers.reducer(initialState, {
        type: Containers.TOGGLE_FOLD_CONTAINER,
        payload: { containerId: 'idCont0' }
      });

      expect(reducer2).toEqual({
        keepPreviousValues: '',
        selectedContainerId: '',
        byId: {
          keepPreviousValues: '',
          idCont0: {
            keepPreviousValues: '',
            isFolded: false
          }
        },
        allIds: ['idCont0']
      });
    });

    it(`should toggle from false to true`, () => {
      const initialState2: any = {
        keepPreviousValues: '',
        selectedContainerId: '',
        byId: {
          keepPreviousValues: '',
          idCont0: {
            keepPreviousValues: '',
            isFolded: false
          }
        },
        allIds: ['idCont0']
      };

      const reducer = Containers.reducer(initialState2, {
        type: Containers.TOGGLE_FOLD_CONTAINER,
        payload: { containerId: 'idCont0' }
      });

      expect(reducer).toEqual({
        keepPreviousValues: '',
        selectedContainerId: '',
        byId: {
          keepPreviousValues: '',
          idCont0: {
            keepPreviousValues: '',
            isFolded: true
          }
        },
        allIds: ['idCont0']
      });
    });
  });

  describe(Containers.SET_CURRENT_CONTAINER, () => {
    it(`should check action name`, () => {
      expect(Containers.SET_CURRENT_CONTAINER).toEqual(`[Containers] Set current container`);
    });

    it(`should set the current container`, () => {
      const initialState: any = {
        keepPreviousValues: '',
        selectedContainerId: ''
      };

      // setting the current container to an unknown container (so far) should work
      // because we'll be trying to fetch that container right after
      const reducer = Containers.reducer(initialState, {
        type: Containers.SET_CURRENT_CONTAINER,
        payload: { containerId: 'unknown' }
      });

      expect(reducer).toEqual({
        keepPreviousValues: '',
        selectedContainerId: 'unknown'
      });
    });
  });

  describe(Containers.FETCH_CONTAINER_DETAILS, () => {
    it(`should check action name`, () => {
      expect(Containers.FETCH_CONTAINER_DETAILS).toEqual(`[Containers] Fetch container details`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idCont0: {
          keepPreviousValues: '',
        }
      },
      allIds: ['idCont0']
    };

    it(`should set isFetchingDetails to true even if isFetchingDetails doesn't exists yet`, () => {
      expect(Containers.reducer(initialState, {
        type: Containers.FETCH_CONTAINER_DETAILS,
        payload: { containerId: 'idCont0' }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idCont0: {
            keepPreviousValues: '',
            isFetchingDetails: true
          },
        },
        allIds: ['idCont0']
      });
    });
  });

  describe(Containers.FETCH_CONTAINER_DETAILS_SUCCESS, () => {
    it(`should check action name`, () => {
      expect(Containers.FETCH_CONTAINER_DETAILS_SUCCESS).toEqual(`[Containers] Fetch container details success`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idCont0: {
          keepPreviousValues: '',
        }
      },
      allIds: ['idCont0']
    };

    it(`should set isFetchingDetails to false even if isFetchingDetails doesn't exists yet`, () => {
      expect(Containers.reducer(initialState, {
        type: Containers.FETCH_CONTAINER_DETAILS_SUCCESS,
        payload: { containerId: 'idCont0', data: { someData: 'some data' } }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idCont0: {
            keepPreviousValues: '',
            isFetchingDetails: false,
            someData: 'some data'
          }
        },
        allIds: ['idCont0']
      });
    });
  });

  describe(Containers.FETCH_CONTAINER_DETAILS_ERROR, () => {
    it(`should check action name`, () => {
      expect(Containers.FETCH_CONTAINER_DETAILS_ERROR).toEqual(`[Containers] Fetch container details error`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idCont0: {
          keepPreviousValues: '',
          isFetchingDetails: true
        }
      },
      allIds: ['idCont0']
    };

    it(`should set isFetchingDetails to false if the container exists`, () => {
      expect(Containers.reducer(initialState, {
        type: Containers.FETCH_CONTAINER_DETAILS_ERROR,
        payload: { containerId: 'idCont0' }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idCont0: {
            keepPreviousValues: '',
            isFetchingDetails: false
          }
        },
        allIds: ['idCont0']
      });
    });
  });

  describe(Containers.DEPLOY_COMPONENT, () => {
    it(`should check action name`, () => {
      expect(Containers.DEPLOY_COMPONENT).toEqual(`[Containers] Deploy component`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idCont0: {
          keepPreviousValues: ''
        }
      },
      allIds: ['idCont0']
    };

    it(`should set the isDeployingComponent variable to true for an existing container`, () => {
      expect(Containers.reducer(initialState, {
        type: Containers.DEPLOY_COMPONENT,
        payload: { containerId: 'idCont0' }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idCont0: {
            keepPreviousValues: '',
            isDeployingComponent: true
          }
        },
        allIds: ['idCont0']
      });
    });
  });

  describe(Containers.DEPLOY_COMPONENT_ERROR, () => {
    it(`should check action name`, () => {
      expect(Containers.DEPLOY_COMPONENT_ERROR).toEqual(`[Containers] Deploy component error`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idCont0: {
          keepPreviousValues: '',
          isDeployingComponent: true
        }
      },
      allIds: ['idCont0']
    };

    it(`should set the isDeployingComponent variable to false for an existing container`, () => {
      expect(Containers.reducer(initialState, {
        type: Containers.DEPLOY_COMPONENT_ERROR,
        payload: { containerId: 'idCont0' }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idCont0: {
            keepPreviousValues: '',
            isDeployingComponent: false
          }
        },
        allIds: ['idCont0']
      });
    });
  });

  describe(Containers.DEPLOY_COMPONENT_SUCCESS, () => {
    it(`should check action name`, () => {
      expect(Containers.DEPLOY_COMPONENT_SUCCESS).toEqual(`[Containers] Deploy component success`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idCont0: {
          keepPreviousValues: '',
          components: ['idComp0']
        }
      },
      allIds: ['idCont0']
    };

    it(`should set the isDeployingComponent variable to false for an existing container and update the container`, () => {
      expect(Containers.reducer(initialState, {
        type: Containers.DEPLOY_COMPONENT_SUCCESS,
        payload: {
          containerId: 'idCont0',
          component: {
            id: 'idCompNew',
            name: 'New Comp',
            state: 'Started'
          }
        }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idCont0: {
            keepPreviousValues: '',
            isDeployingComponent: false,
            components: ['idComp0', 'idCompNew']
          }
        },
        allIds: ['idCont0']
      });
    });
  });

  describe(Components.REMOVE_COMPONENT, () => {
    it(`should return the same object if the container of the component doesn't exists`, () => {
      const initialState: any = {
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idCont0: {
            id: 'idCont0',
            keepPreviousValues: '',
            components: ['idComp0']
          }
        },
        allIds: ['idCont0']
      };

      expect(Containers.reducer(initialState, {
        type: Components.REMOVE_COMPONENT,
        payload: { componentId: 'unknownComp' }
      })).toBe(initialState);
    });

    it(`should remove a component from a container`, () => {
      const initialState: any = {
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idCont0: {
            id: 'idCont0',
            keepPreviousValues: '',
            components: ['idComp0']
          },
          idCont1: {
            id: 'idCont1',
            keepPreviousValues: '',
            components: ['idComp1']
          }
        },
        allIds: ['idCont0', 'idCont1']
      };

      expect(Containers.reducer(initialState, {
        type: Components.REMOVE_COMPONENT,
        payload: { componentId: 'idComp0' }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idCont0: {
            keepPreviousValues: '',
            id: 'idCont0',
            components: []
          },
          idCont1: {
            id: 'idCont1',
            keepPreviousValues: '',
            components: ['idComp1']
          }
        },
        allIds: ['idCont0', 'idCont1']
      });
    });
  });

  describe(Workspaces.CLEAN_WORKSPACE, () => {
    it(`should return the initial value to reset the workspace`, () => {
      const initialState: any = {
        doNotKeepPreviousValues: '',
        byId: {
          doNotKeepPreviousValues: '',
          idCont0: {
            doNotKeepPreviousValues: ''
          }
        },
        allIds: ['idCont0']
      };

      expect(Containers.reducer(undefined, { type: Workspaces.CLEAN_WORKSPACE, payload: { noMatter: 'which payload !' } }))
        .toEqual(containersTableFactory());

      expect(Containers.reducer(initialState, { type: Workspaces.CLEAN_WORKSPACE, payload: { noMatter: 'which payload !' } }))
        .toEqual(containersTableFactory());
    });
  });
});
