/**
 * Copyright (C) 2017-2020 Linagora
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
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { IStore } from '@shared/state/store.interface';

import {
  currentWorkspaceTree,
  WorkspaceElement,
} from '@feat/cockpit/workspaces/state/workspaces/workspaces.selectors';
import { Users } from '@shared/state/users.actions';
import { ICurrentUser } from '@shared/state/users.interface';
import { getCurrentUser } from '@shared/state/users.selectors';

@Component({
  selector: 'app-cockpit',
  templateUrl: './cockpit.component.html',
  styleUrls: ['./cockpit.component.scss'],
})
export class CockpitComponent implements OnInit, OnDestroy {
  user$: Observable<ICurrentUser>;
  isDisconnecting$: Observable<boolean>;
  workspaceId$: Observable<string>;
  tree$: Observable<WorkspaceElement[]>;

  constructor(private store$: Store<IStore>) {}

  ngOnInit() {
    this.workspaceId$ = this.store$.pipe(
      select(state => state.workspaces.selectedWorkspaceId)
    );
    this.tree$ = this.store$.pipe(select(currentWorkspaceTree));
    this.user$ = this.store$.pipe(getCurrentUser);
    this.isDisconnecting$ = this.store$.pipe(
      select(state => state.users.isDisconnecting)
    );
  }

  ngOnDestroy() {
    this.store$.dispatch(new Users.Disconnected());
  }
}
