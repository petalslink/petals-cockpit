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
import { Action } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { ObservableMedia, MediaChange } from '@angular/flex-layout';

import { Ui } from '../state/ui.reducer';

@Injectable()
export class UiEffects {
  private isSmallScreen;

  constructor(
    private actions$: Actions,
    private media$: ObservableMedia
    ) {
    this
      .media$
      .asObservable()
      .subscribe((change: MediaChange) => {
        const screenSize = change.mqAlias;

        if (screenSize === 'xs' || screenSize === 'gt-xs' || screenSize === 'sm') {
          this.isSmallScreen = true;
        } else {
          this.isSmallScreen = false;
        }
      });
  }

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) closeSidenavOnSmallScreen$: Observable<Action> = this.actions$
    .ofType(Ui.CLOSE_SIDENAV_ON_SMALL_SCREEN)
    .filter(_ => this.isSmallScreen)
    .map(_ => ({ type: Ui.CLOSE_SIDENAV }));
}
