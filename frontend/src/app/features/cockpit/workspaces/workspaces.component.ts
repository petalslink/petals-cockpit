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

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';

import { IStore } from 'app/shared/interfaces/store.interface';
import { Ui } from 'app/shared/state/ui.reducer';

@Component({
  selector: 'app-workspaces',
  templateUrl: './workspaces.component.html',
  styleUrls: ['./workspaces.component.scss'],
})
export class WorkspacesComponent implements OnInit, OnDestroy {
  constructor(private store$: Store<IStore>) {}

  ngOnInit() {
    this.store$.dispatch({
      type: Ui.SET_TITLES,
      payload: { titleMainPart1: 'Petals Cockpit', titleMainPart2: '' },
    });
    this.store$.dispatch({ type: Ui.OPEN_POPUP_WORKSPACES_LIST });
  }

  ngOnDestroy() {}
}
