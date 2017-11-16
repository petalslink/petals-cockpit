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

import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { filter, map, withLatestFrom } from 'rxjs/operators';

import { IStore } from 'app/shared/state/store.interface';
import { Ui } from 'app/shared/state/ui.actions';
import { isSmallScreen } from 'app/shared/state/ui.selectors';

@Injectable()
export class UiEffects {
  constructor(private actions$: Actions, private store$: Store<IStore>) {}

  @Effect()
  closeSidenavOnSmallScreen$: Observable<Action> = this.actions$
    .ofType(Ui.CloseSidenavOnSmallScreenType)
    .pipe(
      withLatestFrom(this.store$.pipe(isSmallScreen)),
      filter(([_, ss]) => ss),
      map(_ => new Ui.CloseSidenav())
    );
}
