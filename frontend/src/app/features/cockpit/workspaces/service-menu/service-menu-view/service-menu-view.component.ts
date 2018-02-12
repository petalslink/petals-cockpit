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

import { Services } from 'app/features/cockpit/workspaces/state/services/services.actions';
import { IServiceRow } from 'app/features/cockpit/workspaces/state/services/services.interface';
import { getCurrentServiceTree } from 'app/features/cockpit/workspaces/state/services/services.selectors';
import { TreeElement } from 'app/shared/components/material-tree/material-tree.component';
import { IStore } from 'app/shared/state/store.interface';
import { Ui } from 'app/shared/state/ui.actions';

@Component({
  selector: 'app-service-menu-view',
  templateUrl: './service-menu-view.component.html',
  styleUrls: ['./service-menu-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceMenuViewComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  servicesTree$: Observable<TreeElement<any>[]>;

  @Input() workspaceId: string;
  @Input() services: IServiceRow[];

  constructor(private store$: Store<IStore>) {}

  ngOnInit() {
    this.store$.dispatch(new Services.FetchAll());

    this.servicesTree$ = this.store$.select(getCurrentServiceTree);
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();

    this.store$.dispatch(new Services.Clean());
  }

  closeSidenavOnSmallScreen() {
    this.store$.dispatch(new Ui.CloseSidenavOnSmallScreen());
  }
}
