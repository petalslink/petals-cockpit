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
  getCurrentEndpointServiceInterfaces,
  IEndpointOverview,
} from 'app/features/cockpit/workspaces/state/endpoints/endpoints.selectors';
import { IStore } from 'app/shared/state/store.interface';
import { Ui } from 'app/shared/state/ui.actions';

@Component({
  selector: 'app-services-endpoint-view',
  templateUrl: './services-endpoint-view.component.html',
  styleUrls: ['./services-endpoint-view.component.scss'],
})
export class ServicesEndpointViewComponent implements OnInit {
  endpoint$: Observable<IEndpointOverview>;
  workspaceId$: Observable<string>;

  constructor(private store$: Store<IStore>) {}

  ngOnInit() {
    this.endpoint$ = this.store$.select(getCurrentEndpointServiceInterfaces);

    this.store$.dispatch(
      new Ui.SetTitles({
        titleMainPart1: 'Services',
        titleMainPart2: 'Endpoint',
      })
    );

    this.workspaceId$ = this.store$.select(
      state => state.workspaces.selectedWorkspaceId
    );
  }
}