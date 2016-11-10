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

import { ConfigReducer, TOGGLE_THEME } from './config.reducer';
import { configRecordFactory } from './config.state';
import { IConfig } from './../interfaces/config.interface';
import { IConfigRecord } from './../interfaces/config.interface';

describe(`Config Reducer`, () => {
  let state;

  beforeAll(() => {
    state = configRecordFactory();
  });

  // DEFAULT
  it(`should return the same state (reference) if action.type doesn't match existing action`, () => {
    let nextState: IConfigRecord = ConfigReducer(state, {type: ''});

    expect(state === nextState).toBeTruthy();
  });

  it(`should have a default state`, () => {
    let nextState: IConfig = ConfigReducer(state, {type: ''}).toJS();

    let defaultState = {
      isDarkTheme: false
    };

    expect(nextState).toEqual(defaultState);
  });

  // TOGGLE_THEME
  it(`should toggle dark theme`, () => {
    let nextState: IConfig = ConfigReducer(state, {type: TOGGLE_THEME}).toJS();

    expect(nextState.isDarkTheme).toBeTruthy();
  });
});
