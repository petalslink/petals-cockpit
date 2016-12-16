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

// our interfaces
import { IConfigRecord } from './../interfaces/config.interface';

// our reducers
import { ConfigReducer } from './config.reducer';

// our actions
import { ConfigActions } from './config.actions';

// our states
import { configRecordFactory } from './config.state';

describe(`Config Reducer`, () => {
  let stateR: IConfigRecord;

  beforeAll(() => {
    stateR = configRecordFactory();
  });

  // DEFAULT
  it(`should return the same state (reference) if action.type doesn't match existing action`, () => {
    let nextStateR: IConfigRecord = ConfigReducer(stateR, {type: ''});

    expect(stateR === nextStateR).toBeTruthy();
  });

  it(`should have a default state`, () => {
    let nextStateR: IConfigRecord = ConfigReducer(stateR, {type: ''});
    let nextState = nextStateR.toJS();

    let defaultState = {
      isDarkTheme: false,
      isSidenavVisible: true,
      sidenavMode: 'side'
    };

    expect(nextState).toEqual(defaultState);
  });

  // TOGGLE_THEME
  it(`should toggle dark theme`, () => {
    // from dark to light
    let nextStateR1: IConfigRecord = ConfigReducer(stateR, {type: ConfigActions.TOGGLE_THEME});
    let nextState1 = nextStateR1.toJS();

    expect(nextState1.isDarkTheme).toBe(true);

    // from (previous) light to dark
    let nextStateR2: IConfigRecord = ConfigReducer(nextStateR1, {type: ConfigActions.TOGGLE_THEME});
    let nextState2 = nextStateR2.toJS();

    expect(nextState2.isDarkTheme).toBe(false);
  });

  // OPEN_SIDENAV
  it(`should changed isSidenavVisible from false to true`, () => {
    let stateRTmp = stateR
      .set('isSidenavVisible', false);

    let nextStateR: IConfigRecord = ConfigReducer(stateRTmp, {type: ConfigActions.OPEN_SIDENAV});
    let nextState = nextStateR.toJS();

    expect(nextState.isSidenavVisible).toBe(true);
  });

  // CLOSE_SIDENAV
  it(`${ConfigActions.CLOSE_SIDENAV}`, () => {
    let stateRTmp = stateR
      .set('isSidenavVisible', true);

    let nextStateR: IConfigRecord = ConfigReducer(stateRTmp, {type: ConfigActions.CLOSE_SIDENAV});
    let nextState = nextStateR.toJS();

    expect(nextState.isSidenavVisible).toBe(false);
  });

  // TOGGLE_SIDENAV
  it(`${ConfigActions.TOGGLE_SIDENAV}`, () => {
    // from open to close
    let stateRTmp = stateR
      .set('isSidenavVisible', true);

    let nextStateR1: IConfigRecord = ConfigReducer(stateRTmp, {type: ConfigActions.TOGGLE_SIDENAV});
    let nextState1 = nextStateR1.toJS();

    expect(nextState1.isSidenavVisible).toBe(false);

    // from (previous) close to open
    let nextStateR2: IConfigRecord = ConfigReducer(nextStateR1, {type: ConfigActions.TOGGLE_SIDENAV});
    let nextState2 = nextStateR2.toJS();

    expect(nextState2.isSidenavVisible).toBe(true);
  });

  // CLOSE_SIDENAV_IF_MOBILE
  it(`${ConfigActions.CLOSE_SIDENAV_IF_MOBILE}`, () => {
    let stateRTmp = stateR
      .merge({
        'sidenavMode': 'over',
        'isSidenavVisible': false
      });

    let nextStateR1: IConfigRecord = ConfigReducer(stateRTmp, {
      type: ConfigActions.CLOSE_SIDENAV_IF_MOBILE,
      payload: 'over'
    });
    let nextState1 = nextStateR1.toJS();

    let expectedState1 = {
      sidenavMode: 'over',
      isSidenavVisible: false
    };

    expect(nextState1).toEqual(jasmine.objectContaining(expectedState1));

    let nextStateR2: IConfigRecord = ConfigReducer(nextStateR1, {
      type: ConfigActions.CLOSE_SIDENAV_IF_MOBILE,
      payload: 'side'
    });

    expect(nextStateR2.toJS()).toEqual(jasmine.objectContaining(expectedState1));
  });

  // SET_SIDENAV_MODE
  it(`${ConfigActions.SET_SIDENAV_MODE}`, () => {
    let stateRTmp = stateR
      .set('sidenavMode', 'side');

    let nextStateR1: IConfigRecord = ConfigReducer(stateRTmp, {type: ConfigActions.SET_SIDENAV_MODE, payload: 'over'});

    expect(nextStateR1.get('sidenavMode')).toEqual('over');

    let nextStateR2: IConfigRecord = ConfigReducer(nextStateR1, {type: ConfigActions.SET_SIDENAV_MODE, payload: 'side'});

    expect(nextStateR2.get('sidenavMode')).toEqual('side');
  });
});
