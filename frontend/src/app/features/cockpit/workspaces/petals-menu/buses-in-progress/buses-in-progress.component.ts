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

import { IBusInProgress } from 'app/features/cockpit/workspaces/state/buses-in-progress/buses-in-progress.interface';
import { IStore } from 'app/shared/state/store.interface';
import { Ui } from 'app/shared/state/ui.actions';

@Component({
  selector: 'app-buses-in-progress',
  templateUrl: './buses-in-progress.component.html',
  styleUrls: ['./buses-in-progress.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusesInProgressComponent implements OnInit {
  @Input() busesInProgress: IBusInProgress[];
  @Input() workspaceId: string;

  constructor(private store$: Store<IStore>) {}

  ngOnInit() {}

  closeSidenavOnSmallScreen() {
    this.store$.dispatch(new Ui.CloseSidenavOnSmallScreen());
  }

  trackByBusInProgress(i: number, busInProgress: IBusInProgress) {
    return busInProgress.id;
  }
}
