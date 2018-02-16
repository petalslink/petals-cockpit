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

import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { Endpoints } from 'app/features/cockpit/workspaces/state/endpoints/endpoints.actions';
import { IEndpointRow } from 'app/features/cockpit/workspaces/state/endpoints/endpoints.interface';
import { getCurrentEndpointTree } from 'app/features/cockpit/workspaces/state/endpoints/endpoints.selectors';
import { Services } from 'app/features/cockpit/workspaces/state/services/services.actions';
import { IServiceRow } from 'app/features/cockpit/workspaces/state/services/services.interface';
import { getCurrentServiceTree } from 'app/features/cockpit/workspaces/state/services/services.selectors';
import { TreeElement } from 'app/shared/components/material-tree/material-tree.component';
import { IStore } from 'app/shared/state/store.interface';
import { Ui } from 'app/shared/state/ui.actions';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-services-menu-view',
  templateUrl: './services-menu-view.component.html',
  styleUrls: ['./services-menu-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesMenuViewComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  servicesTree$: Observable<TreeElement<any>[]>;
  endpointsTree$: Observable<TreeElement<any>[]>;

  @Input() workspaceId: string;
  @Input() services: IServiceRow[];
  @Input() endpoints: IEndpointRow[];

  constructor(private store$: Store<IStore>) {}

  ngOnInit() {
    this.servicesTree$ = this.store$
      .select(getCurrentServiceTree)
      .pipe(takeUntil(this.onDestroy$));

    this.endpointsTree$ = this.store$
      .select(getCurrentEndpointTree)
      .pipe(takeUntil(this.onDestroy$));
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();

    this.store$.dispatch(new Services.Clean());
    this.store$.dispatch(new Endpoints.Clean());
  }

  closeSidenavOnSmallScreen() {
    this.store$.dispatch(new Ui.CloseSidenavOnSmallScreen());
  }
}
