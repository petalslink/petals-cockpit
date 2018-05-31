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
  OnInit,
} from '@angular/core';

import { Store } from '@ngrx/store';
import { IServiceOverview } from 'app/features/cockpit/workspaces/state/services/services.selectors';
import { IStore } from 'app/shared/state/store.interface';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-services-service-overview',
  templateUrl: './services-service-overview.component.html',
  styleUrls: ['./services-service-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesServiceOverviewComponent implements OnInit {
  @Input() service: IServiceOverview;
  @Input() workspaceId: string;

  public workspaceId$: Observable<string>;

  constructor(private store$: Store<IStore>) {}

  ngOnInit() {
    this.workspaceId$ = this.store$.select(
      state => state.workspaces.selectedWorkspaceId
    );
  }
}
