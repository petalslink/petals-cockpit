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

import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import {
  getCurrentServiceInterfacesEndpoints,
  IServiceOverview,
} from 'app/features/cockpit/workspaces/state/services/services.selectors';
import { IStore } from 'app/shared/state/store.interface';
import { Ui } from 'app/shared/state/ui.actions';

@Component({
  selector: 'app-services-service-view',
  templateUrl: './services-service-view.component.html',
  styleUrls: ['./services-service-view.component.scss'],
})
export class ServicesServiceViewComponent implements OnInit {
  service$: Observable<IServiceOverview>;
  workspaceId$: Observable<string>;

  constructor(private store$: Store<IStore>) {}

  ngOnInit() {
    this.service$ = this.store$.select(getCurrentServiceInterfacesEndpoints);

    this.store$.dispatch(
      new Ui.SetTitles({
        titleMainPart1: 'Services',
        titleMainPart2: 'Service',
      })
    );

    this.workspaceId$ = this.store$.select(
      state => state.workspaces.selectedWorkspaceId
    );
  }
}