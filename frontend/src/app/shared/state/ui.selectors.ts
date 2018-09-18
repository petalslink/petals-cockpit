/**
 * Copyright (C) 2017-2018 Linagora
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

import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { IStore } from './store.interface';
import { ScreenSize } from './ui.interface';

const _isLargeScreen = (ss: ScreenSize) =>
  ss === 'md' || ss === 'lg' || ss === 'gt-lg' || ss === 'xl' || ss === 'gt-md';

const getScreenSize = (state: IStore) => state.ui.screenSize;

export const isLargeScreen = (store$: Store<IStore>): Observable<boolean> => {
  return store$.pipe(
    select(getScreenSize),
    map(_isLargeScreen),
    distinctUntilChanged()
  );
};

export const isSmallScreen = (store$: Store<IStore>): Observable<boolean> => {
  return isLargeScreen(store$).pipe(map(b => !b));
};
