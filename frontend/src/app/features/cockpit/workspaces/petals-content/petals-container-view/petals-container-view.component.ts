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

import { IStore } from '@shared/state/store.interface';
import { Ui } from '@shared/state/ui.actions';
import {
  componentsOfCurrentContainerByName,
  getCurrentContainer,
  IContainerWithSiblings,
  serviceAssembliesOfCurrentContainerByName,
  sharedLibrariesOfCurrentContainerByNameAndVersion,
} from '@wks/state/containers/containers.selectors';

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
  sharedLibrariesOfCurrentContainerByNameAndVersion$: Observable<{
    [nameAndVersion: string]: boolean;
  }>;
  serviceAssembliesOfCurrentContainerByName$: Observable<{
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

    this.workspaceId$ = this.store$.pipe(
      select(state => state.workspaces.selectedWorkspaceId)
    );

    this.container$ = this.store$.pipe(select(getCurrentContainer));

    this.componentsOfCurrentContainerByName$ = this.store$.pipe(
      select(componentsOfCurrentContainerByName)
    );
    this.sharedLibrariesOfCurrentContainerByNameAndVersion$ = this.store$.pipe(
      select(sharedLibrariesOfCurrentContainerByNameAndVersion)
    );
    this.serviceAssembliesOfCurrentContainerByName$ = this.store$.pipe(
      select(serviceAssembliesOfCurrentContainerByName)
    );
  }
}
