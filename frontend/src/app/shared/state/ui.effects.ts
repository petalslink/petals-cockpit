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

import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, map, tap, withLatestFrom } from 'rxjs/operators';

import { IStore } from '@shared/state/store.interface';

// TODO Fix Lint error: all imports on this line are unused.
// tslint:disable: no-unused-variable
import { LocalStorageService } from 'ngx-webstorage';
import { Ui } from './ui.actions';
import { SETTINGS_THEME_KEY } from './ui.interface';
import { isSmallScreen } from './ui.selectors';

@Injectable()
export class UiEffects {
  constructor(
    private actions$: Actions,
    private store$: Store<IStore>,
    private localStorageService: LocalStorageService
  ) {}

  @Effect()
  closeSidenavOnSmallScreen$: Observable<Action> = this.actions$
    .ofType(Ui.CloseSidenavOnSmallScreenType)
    .pipe(
      withLatestFrom(this.store$.pipe(isSmallScreen)),
      filter(([_, ss]) => ss),
      map(_ => new Ui.CloseSidenav())
    );

  @Effect({ dispatch: false })
  changeTheme$: Observable<Action> = this.actions$
    .ofType(Ui.ChangeThemeType)
    .pipe(
      tap((action: Ui.ChangeTheme) =>
        this.localStorageService.store(SETTINGS_THEME_KEY, action.payload.theme)
      )
    );
}
