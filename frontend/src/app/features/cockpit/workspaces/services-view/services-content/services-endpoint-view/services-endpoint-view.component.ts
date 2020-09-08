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
import { Observable, Subject } from 'rxjs';

import { IStore } from '@shared/state/store.interface';
import {
  getCurrentEndpointOverview,
  IEndpointOverview,
} from '@wks/state/endpoints/endpoints.selectors';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-services-endpoint-view',
  templateUrl: './services-endpoint-view.component.html',
  styleUrls: ['./services-endpoint-view.component.scss'],
})
export class ServicesEndpointViewComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  endpoint$: Observable<IEndpointOverview>;
  workspaceId$: Observable<string>;

  isDeleted = false;

  constructor(private store$: Store<IStore>) {}

  ngOnInit() {
    this.endpoint$ = this.store$.pipe(
      select(getCurrentEndpointOverview),
      takeUntil(this.onDestroy$),
      filter(edp => {
        this.isDeleted = edp === undefined;
        return !this.isDeleted;
      })
    );

    this.workspaceId$ = this.store$.pipe(
      select(state => state.workspaces.selectedWorkspaceId)
    );
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
