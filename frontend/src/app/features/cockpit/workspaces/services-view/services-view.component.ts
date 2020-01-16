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
import { takeUntil } from 'rxjs/operators';

import { IStore } from '@shared/state/store.interface';
import { IEndpointRow } from '@wks/state/endpoints/endpoints.interface';
import { getAllEndpoints } from '@wks/state/endpoints/endpoints.selectors';
import { IInterfaceRow } from '@wks/state/interfaces/interfaces.interface';
import { getAllInterfaces } from '@wks/state/interfaces/interfaces.selectors';
import { IServiceRow } from '@wks/state/services/services.interface';
import { getAllServices } from '@wks/state/services/services.selectors';

@Component({
  selector: 'app-services-view',
  templateUrl: './services-view.component.html',
  styleUrls: ['./services-view.component.scss'],
})
export class ServicesViewComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  workspaceId$: Observable<string>;
  interfaces$: Observable<IInterfaceRow[]>;
  endpoints$: Observable<IEndpointRow[]>;
  services$: Observable<IServiceRow[]>;

  constructor(private store$: Store<IStore>) {}

  ngOnInit() {
    this.workspaceId$ = this.store$.pipe(
      select(state => state.workspaces.selectedWorkspaceId)
    );

    this.interfaces$ = this.store$.pipe(
      select(getAllInterfaces),
      takeUntil(this.onDestroy$)
    );

    this.services$ = this.store$.pipe(
      select(getAllServices),
      takeUntil(this.onDestroy$)
    );

    this.endpoints$ = this.store$.pipe(
      select(getAllEndpoints),
      takeUntil(this.onDestroy$)
    );
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
