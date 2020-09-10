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

import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { IInterfaceRowWithQName } from '@feat/cockpit/workspaces/state/interfaces/interfaces.interface';
import { IStore } from '@shared/state/store.interface';
import {
  getCurrentServiceOverview,
  IServiceOverview,
} from '@wks/state/services/services.selectors';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-services-service-view',
  templateUrl: './services-service-view.component.html',
  styleUrls: ['./services-service-view.component.scss'],
})
export class ServicesServiceViewComponent implements OnInit {
  service$: Observable<IServiceOverview>;
  workspaceId$: Observable<string>;

  isDeleted = false;

  displayedColumns: String[] = [
    'actions',
    'name',
    'interfaces',
    'component',
    'container',
    'bus',
  ];
  constructor(private store$: Store<IStore>) {}

  ngOnInit() {
    this.service$ = this.store$.pipe(
      select(getCurrentServiceOverview),
      filter(service => {
        this.isDeleted = service === undefined;
        return !this.isDeleted;
      })
    );

    this.workspaceId$ = this.store$.pipe(
      select(state => state.workspaces.selectedWorkspaceId)
    );
  }

  renderInterfacesList(interfaces: IInterfaceRowWithQName[]): string {
    return interfaces.map(int => int.localpart).join('<br />');
  }
}
