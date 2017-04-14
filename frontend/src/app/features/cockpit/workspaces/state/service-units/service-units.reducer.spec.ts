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

import { ServiceUnits } from 'app/features/cockpit/workspaces/state/service-units/service-units.reducer';
import { type } from 'app/shared/helpers/shared.helper';
import { Workspaces } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.reducer';
import { serviceUnitsTableFactory } from 'app/features/cockpit/workspaces/state/service-units/service-units.interface';

describe(`ServiceUnits reducer`, () => {
  it(`should have a default value`, () => {
    expect(ServiceUnits.reducer(undefined, { type: `init`, payload: `` }))
      .toEqual({
        selectedServiceUnitId: '',
        isFetchingDetails: false,

        byId: {},
        allIds: []
      });
  });

  describe(type(ServiceUnits.FETCH_SERVICE_UNITS_SUCCESS), () => {
    it(`should check action name`, () => {
      expect(ServiceUnits.FETCH_SERVICE_UNITS_SUCCESS).toEqual(`SERVICE_UNITS_REDUCER_FETCH_SERVICE_UNITS_SUCCESS`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idSu0: {
          doNotKeepPreviousValuesIfUpdate: '',
          name: 'SU 0',
          id: 'idSu0'
        },
        idSu1: {
          doNotKeepPreviousValuesIfUpdate: '',
          name: 'SU 1',
          id: 'idSu1'
        }
      },
      allIds: [
        'idSu0',
        'idSu1'
      ]
    };

    it(`should replace a service-unit if already existing (not update)`, () => {
      expect(ServiceUnits.reducer(initialState, {
        type: ServiceUnits.FETCH_SERVICE_UNITS_SUCCESS,
        payload: {
          byId: {
            idSu0: {
              name: 'SU 0 updated name',
              id: 'idSu0'
            },
            idSu1: {
              name: 'SU 1 updated name',
              id: 'idSu1'
            }
          },
          allIds: [
            'idSu0',
            'idSu1'
          ]
        }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idSu0: {
            name: 'SU 0 updated name',
            id: 'idSu0',
            isFolded: false,
            isUpdatingState: false
          },
          idSu1: {
            name: 'SU 1 updated name',
            id: 'idSu1',
            isFolded: false,
            isUpdatingState: false
          }
        },
        allIds: [
          'idSu0',
          'idSu1'
        ]
      });
    });

    it(`should add a service-unit if doesn't exists yet`, () => {
      expect(ServiceUnits.reducer(initialState, {
        type: ServiceUnits.FETCH_SERVICE_UNITS_SUCCESS,
        payload: {
          byId: {
            idSu2: {
              name: 'SU 2',
              id: 'idSu2'
            },
            idSu3: {
              name: 'SU 3',
              id: 'idSu3'
            }
          },
          allIds: [
            'idSu2',
            'idSu3'
          ]
        }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idSu0: {
            doNotKeepPreviousValuesIfUpdate: '',
            name: 'SU 0',
            id: 'idSu0'
          },
          idSu1: {
            doNotKeepPreviousValuesIfUpdate: '',
            name: 'SU 1',
            id: 'idSu1'
          },
          idSu2: {
            name: 'SU 2',
            id: 'idSu2',
            isFolded: false,
            isUpdatingState: false
          },
          idSu3: {
            name: 'SU 3',
            id: 'idSu3',
            isFolded: false,
            isUpdatingState: false
          }
        },
        allIds: [
          'idSu0',
          'idSu1',
          'idSu2',
          'idSu3'
        ]
      });
    });
  });

  describe(type(ServiceUnits.SET_CURRENT_SERVICE_UNIT), () => {
    it(`should check action name`, () => {
      expect(ServiceUnits.SET_CURRENT_SERVICE_UNIT).toEqual(`SERVICE_UNITS_REDUCER_SET_CURRENT_SERVICE_UNIT`);
    });

    it(`should set the current service-unit`, () => {
      const initialState: any = {
        keepPreviousValues: '',
        selectedServiceUnitId: ''
      };

      // setting the current service-unit to an unknown service-unit (so far) should work
      // because we'll be trying to fetch it right after
      const reducer = ServiceUnits.reducer(initialState, {
        type: ServiceUnits.SET_CURRENT_SERVICE_UNIT,
        payload: { serviceUnitId: 'unknown' }
      });

      expect(reducer).toEqual({
        keepPreviousValues: '',
        selectedServiceUnitId: 'unknown'
      });
    });
  });

  describe(type(ServiceUnits.FETCH_SERVICE_UNIT_DETAILS), () => {
    it(`should check action name`, () => {
      expect(ServiceUnits.FETCH_SERVICE_UNIT_DETAILS).toEqual(`SERVICE_UNITS_REDUCER_FETCH_SERVICE_UNIT_DETAILS`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idSu0: {
          keepPreviousValues: '',
        }
      },
      allIds: ['idSu0']
    };

    it(`should set isFetchingDetails to true even if isFetchingDetails doesn't exists yet`, () => {
      expect(ServiceUnits.reducer(initialState, {
        type: ServiceUnits.FETCH_SERVICE_UNIT_DETAILS,
        payload: { serviceUnitId: 'idSu0' }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idSu0: {
            keepPreviousValues: '',
            isFetchingDetails: true
          },
        },
        allIds: ['idSu0']
      });
    });
  });

  describe(type(ServiceUnits.FETCH_SERVICE_UNIT_DETAILS_SUCCESS), () => {
    it(`should check action name`, () => {
      expect(ServiceUnits.FETCH_SERVICE_UNIT_DETAILS_SUCCESS).toEqual(`SERVICE_UNITS_REDUCER_FETCH_SERVICE_UNIT_DETAILS_SUCCESS`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idSu0: {
          keepPreviousValues: '',
        }
      },
      allIds: ['idSu0']
    };

    it(`should set isFetchingDetails to false even if isFetchingDetails doesn't exists yet`, () => {
      expect(ServiceUnits.reducer(initialState, {
        type: ServiceUnits.FETCH_SERVICE_UNIT_DETAILS_SUCCESS,
        payload: { serviceUnitId: 'idSu0', data: { someData: 'some data' } }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idSu0: {
            keepPreviousValues: '',
            isFetchingDetails: false,
            someData: 'some data'
          }
        },
        allIds: ['idSu0']
      });
    });
  });

  describe(type(ServiceUnits.FETCH_SERVICE_UNIT_DETAILS_ERROR), () => {
    it(`should check action name`, () => {
      expect(ServiceUnits.FETCH_SERVICE_UNIT_DETAILS_ERROR).toEqual(`SERVICE_UNITS_REDUCER_FETCH_SERVICE_UNIT_DETAILS_ERROR`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idSu0: {
          keepPreviousValues: '',
          isFetchingDetails: true
        }
      },
      allIds: ['idSu0']
    };

    it(`should set isFetchingDetails to false if the service-unit exists`, () => {
      expect(ServiceUnits.reducer(initialState, {
        type: ServiceUnits.FETCH_SERVICE_UNIT_DETAILS_ERROR,
        payload: { serviceUnitId: 'idSu0' }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idSu0: {
            keepPreviousValues: '',
            isFetchingDetails: false
          }
        },
        allIds: ['idSu0']
      });
    });
  });

  describe(type(ServiceUnits.CHANGE_STATE), () => {
    it(`should check action name`, () => {
      expect(ServiceUnits.CHANGE_STATE).toEqual(`SERVICE_UNITS_REDUCER_CHANGE_STATE`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idSu0: {
          keepPreviousValues: ''
        }
      },
      allIds: ['idSu0']
    };

    it(`should change the isUpdatingState variable of an existing service-unit to true`, () => {
      expect(ServiceUnits.reducer(initialState, {
        type: ServiceUnits.CHANGE_STATE,
        payload: { serviceUnitId: 'idSu0' }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idSu0: {
            keepPreviousValues: '',
            isUpdatingState: true
          }
        },
        allIds: ['idSu0']
      });
    });
  });

  describe(type(ServiceUnits.CHANGE_STATE_SUCCESS), () => {
    it(`should check action name`, () => {
      expect(ServiceUnits.CHANGE_STATE_SUCCESS).toEqual(`SERVICE_UNITS_REDUCER_CHANGE_STATE_SUCCESS`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idSu0: {
          keepPreviousValues: ''
        }
      },
      allIds: ['idSu0']
    };

    it(`should update an existing service-unit by setting UI variables and the state`, () => {
      expect(ServiceUnits.reducer(initialState, {
        type: ServiceUnits.CHANGE_STATE_SUCCESS,
        payload: { serviceUnitId: 'idSu0', newState: 'Started' }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idSu0: {
            keepPreviousValues: '',
            isUpdatingState: false,
            state: 'Started'
          }
        },
        allIds: ['idSu0']
      });
    });
  });

  describe(type(ServiceUnits.CHANGE_STATE_ERROR), () => {
    it(`should check action name`, () => {
      expect(ServiceUnits.CHANGE_STATE_ERROR).toEqual(`SERVICE_UNITS_REDUCER_CHANGE_STATE_ERROR`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idSu0: {
          keepPreviousValues: ''
        }
      },
      allIds: ['idSu0']
    };

    it(`should change the isUpdatingState variable of an existing service-unit to false`, () => {
      expect(ServiceUnits.reducer(initialState, {
        type: ServiceUnits.CHANGE_STATE_ERROR,
        payload: { serviceUnitId: 'idSu0' }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idSu0: {
            keepPreviousValues: '',
            isUpdatingState: false
          }
        },
        allIds: ['idSu0']
      });
    });
  });

  describe(type(ServiceUnits.REMOVE_SERVICE_UNIT), () => {
    it(`should check action name`, () => {
      expect(ServiceUnits.REMOVE_SERVICE_UNIT).toEqual(`SERVICE_UNITS_REDUCER_REMOVE_SERVICE_UNIT`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idSu0: {
          keepPreviousValues: ''
        },
        idSu1: {
          keepPreviousValues: ''
        },
        idSu2: {
          keepPreviousValues: ''
        }
      },
      allIds: ['idSu0', 'idSu1', 'idSu2']
    };

    it(`should remove an existing service-unit`, () => {
      expect(ServiceUnits.reducer(initialState, {
        type: ServiceUnits.REMOVE_SERVICE_UNIT,
        payload: { serviceUnitId: 'idSu0' }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idSu1: {
            keepPreviousValues: ''
          },
          idSu2: {
            keepPreviousValues: ''
          }
        },
        allIds: ['idSu1', 'idSu2']
      });

      expect(ServiceUnits.reducer(initialState, {
        type: ServiceUnits.REMOVE_SERVICE_UNIT,
        payload: { serviceUnitId: 'idSu1' }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idSu0: {
            keepPreviousValues: ''
          },
          idSu2: {
            keepPreviousValues: ''
          }
        },
        allIds: ['idSu0', 'idSu2']
      });

      expect(ServiceUnits.reducer(initialState, {
        type: ServiceUnits.REMOVE_SERVICE_UNIT,
        payload: { serviceUnitId: 'idSu2' }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idSu0: {
            keepPreviousValues: ''
          },
          idSu1: {
            keepPreviousValues: ''
          }
        },
        allIds: ['idSu0', 'idSu1']
      });
    });
  });

  describe(`COMPONENTS_REDUCER_DEPLOY_SERVICE_UNIT_SUCCESS`, () => {
    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idSu0: {
          doNotKeepPreviousValuesIfUpdate: ''
        }
      },
      allIds: ['idSu0']
    };

    it(`should add a non existing service-unit`, () => {
      expect(ServiceUnits.reducer(initialState, {
        type: 'COMPONENTS_REDUCER_DEPLOY_SERVICE_UNIT_SUCCESS',
        payload: { serviceUnit: { id: 'idSu1', name: 'Su 1', state: 'Started' } }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idSu0: {
            doNotKeepPreviousValuesIfUpdate: ''
          },
          idSu1: {
            id: 'idSu1',
            name: 'Su 1',
            state: 'Started',
            isFolded: false,
            isUpdatingState: false
          }
        },
        allIds: ['idSu0', 'idSu1']
      });
    });
  });

  describe(type(Workspaces.CLEAN_WORKSPACE), () => {
    it(`should return the initial value to reset the service-units`, () => {
      const initialState: any = {
        doNotKeepPreviousValues: '',
        byId: {
          doNotKeepPreviousValues: '',
          idSu0: {
            doNotKeepPreviousValues: ''
          }
        },
        allIds: ['idSu0']
      };

      expect(ServiceUnits.reducer(undefined, {
        type: Workspaces.CLEAN_WORKSPACE,
        payload: { noMatter: 'which payload !' }
      })).toEqual(serviceUnitsTableFactory());

      expect(ServiceUnits.reducer(initialState, {
        type: Workspaces.CLEAN_WORKSPACE,
        payload: { noMatter: 'which payload !' }
      })).toEqual(serviceUnitsTableFactory());
    });
  });
});
