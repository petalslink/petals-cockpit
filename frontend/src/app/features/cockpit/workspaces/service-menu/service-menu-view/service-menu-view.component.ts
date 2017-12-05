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

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { Services } from 'app/features/cockpit/workspaces/state/services/services.actions';
import { IServiceRow } from 'app/features/cockpit/workspaces/state/services/services.interface';
import { getAllServices } from 'app/features/cockpit/workspaces/state/services/services.selectors';
import { IStore } from 'app/shared/state/store.interface';
import { Ui } from 'app/shared/state/ui.actions';

@Component({
  selector: 'app-service-menu-view',
  templateUrl: './service-menu-view.component.html',
  styleUrls: ['./service-menu-view.component.scss'],
})
export class ServiceMenuViewComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  services$: Observable<IServiceRow[]>;

  @Input() workspaceId: string;
  @Input() services: IServiceRow[];

  constructor(private store$: Store<IStore>) {}

  ngOnInit() {
    this.store$.dispatch(new Services.FetchAll());

    this.services$ = this.store$.select(getAllServices);
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  closeSidenavOnSmallScreen() {
    this.store$.dispatch(new Ui.CloseSidenavOnSmallScreen());
  }
}
