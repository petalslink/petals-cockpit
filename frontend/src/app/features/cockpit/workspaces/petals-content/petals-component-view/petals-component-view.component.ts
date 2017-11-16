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

import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { IStore } from 'app/shared/state/store.interface';
import { Ui } from 'app/shared/state/ui.actions';
import {
  getCurrentComponent,
  IComponentWithSLsAndSUs,
} from '../../state/components/components.selectors';

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
    this.store$.dispatch(
      new Ui.SetTitles({
        titleMainPart1: 'Petals',
        titleMainPart2: 'Component',
      })
    );

    this.component$ = this.store$.select(getCurrentComponent);

    this.workspaceId$ = this.store$.select(
      state => state.workspaces.selectedWorkspaceId
    );
  }
}
