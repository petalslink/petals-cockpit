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

import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { MatSort } from '@angular/material/sort';
import { IContainerRow } from '@feat/cockpit/workspaces/state/containers/containers.interface';
import { IStore } from '@shared/state/store.interface';
import {
  getCurrentBus,
  IBusWithContainers,
} from '@wks/state/buses/buses.selectors';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-petals-bus-view',
  templateUrl: './petals-bus-view.component.html',
  styleUrls: ['./petals-bus-view.component.scss'],
})
export class PetalsBusViewComponent implements OnInit {
  workspaceId$: Observable<string>;
  bus$: Observable<IBusWithContainers>;

  dataSource = new MatTableDataSource<IContainerRow>([]);
  displayedColumns: string[] = ['name', 'ip', 'port', 'reachable'];
  sortDirection = 'asc';
  sortableColumn = 'name';

  @ViewChild(MatSort) sort: MatSort;

  constructor(private store$: Store<IStore>) {}

  ngOnInit() {
    this.workspaceId$ = this.store$.pipe(
      select(state => state.workspaces.selectedWorkspaceId)
    );

    this.bus$ = this.store$.pipe(
      select(getCurrentBus),
      tap(data => {
        if (data) {
          this.dataSource.data = data.containers;
          this.dataSource.sort = this.sort;
          this.getSortingDataOfReachability();
        }
      })
    );
  }

  getSortingDataOfReachability() {
    this.dataSource.sortingDataAccessor = (cont: any, property: string) => {
      switch (property) {
        case 'reachable': {
          return String(cont.isReachable);
        }
        default:
          return cont[property];
      }
    };
  }
}
