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

import {
  componentsOfCurrentContainerByName,
  getCurrentContainer,
  IContainerWithSiblings,
  sharedLibrariesOfCurrentContainerByName,
} from 'app/features/cockpit/workspaces/state/containers/containers.selectors';
import { IStore } from 'app/shared/state/store.interface';
import { Ui } from 'app/shared/state/ui.actions';

@Component({
  selector: 'app-petals-container-view',
  templateUrl: './petals-container-view.component.html',
  styleUrls: ['./petals-container-view.component.scss'],
})
export class PetalsContainerViewComponent implements OnInit {
  workspaceId$: Observable<string>;
  container$: Observable<IContainerWithSiblings>;
  componentsOfCurrentContainerByName$: Observable<{
    [name: string]: boolean;
  }>;
  sharedLibrariesOfCurrentContainerByName$: Observable<{
    [name: string]: boolean;
  }>;

  constructor(private store$: Store<IStore>) {}

  ngOnInit() {
    this.store$.dispatch(
      new Ui.SetTitles({
        titleMainPart1: 'Petals',
        titleMainPart2: 'Container',
      })
    );

    this.workspaceId$ = this.store$.select(
      state => state.workspaces.selectedWorkspaceId
    );

    this.container$ = this.store$.select(getCurrentContainer);

    this.componentsOfCurrentContainerByName$ = this.store$.select(
      componentsOfCurrentContainerByName
    );
    this.sharedLibrariesOfCurrentContainerByName$ = this.store$.select(
      sharedLibrariesOfCurrentContainerByName
    );
  }
}
