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

// our actions
import { ConfigReducer, TOGGLE_THEME } from './config.reducer';

// our states
import { configRecordFactory } from './config.state';

// our interfaces
import { IConfigRecord } from './../interfaces/config.interface';

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
      isDarkTheme: false
    };

    expect(nextState).toEqual(defaultState);
  });

  // TOGGLE_THEME
  it(`should toggle dark theme`, () => {
    let nextStateR: IConfigRecord = ConfigReducer(stateR, {type: TOGGLE_THEME});
    let nextState = nextStateR.toJS();

    expect(nextState.isDarkTheme).toBeTruthy();
  });
});
