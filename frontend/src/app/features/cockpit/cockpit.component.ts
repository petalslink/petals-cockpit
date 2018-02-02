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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { IStore } from 'app/shared/state/store.interface';
import { IUi } from 'app/shared/state/ui.interface';
import { isLargeScreen } from 'app/shared/state/ui.selectors';
import { Users } from 'app/shared/state/users.actions';
import { ICurrentUser } from 'app/shared/state/users.interface';
import { getCurrentUser } from 'app/shared/state/users.selectors';

@Component({
  selector: 'app-cockpit',
  templateUrl: './cockpit.component.html',
  styleUrls: ['./cockpit.component.scss'],
})
export class CockpitComponent implements OnInit, OnDestroy {
  isLargeScreen$: Observable<boolean>;
  ui$: Observable<IUi>;
  user$: Observable<ICurrentUser>;
  isDisconnecting$: Observable<boolean>;
  isOnWorkspace$: Observable<boolean>;

  constructor(private store$: Store<IStore>) {}

  ngOnInit() {
    this.isLargeScreen$ = this.store$.pipe(isLargeScreen);
    this.user$ = this.store$.pipe(getCurrentUser);
    this.isDisconnecting$ = this.store$.select(
      state => state.users.isDisconnecting
    );

    this.isOnWorkspace$ = this.store$.select(
      state => !!state.workspaces.selectedWorkspaceId
    );
    this.ui$ = this.store$.select(state => state.ui);
  }

  ngOnDestroy() {
    this.store$.dispatch(new Users.Disconnected());
  }
}
