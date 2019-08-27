/**
 * Copyright (C) 2017-2019 Linagora
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

import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import {
  getCurrentComponent,
  IComponentWithSLsAndSUs,
} from '@feat/cockpit/workspaces/state/components/components.selectors';
import { IStore } from '@shared/state/store.interface';

@Component({
  selector: 'app-petals-component-view',
  templateUrl: './petals-component-view.component.html',
  styleUrls: ['./petals-component-view.component.scss'],
})
export class PetalsComponentViewComponent implements OnInit {
  public component$: Observable<IComponentWithSLsAndSUs>;
  public workspaceId$: Observable<string>;

  constructor(private store$: Store<IStore>) {}

  ngOnInit() {
    this.component$ = this.store$.pipe(select(getCurrentComponent));

    this.workspaceId$ = this.store$.pipe(
      select(state => state.workspaces.selectedWorkspaceId)
    );
  }
}
