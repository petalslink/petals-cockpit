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

import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { IBusesInProgress } from '../../state/buses-in-progress/buses-in-progress.interface';
import { IStore } from '../../../../../shared/interfaces/store.interface';
import { Ui } from '../../../../../shared/state/ui.reducer';

@Component({
  selector: 'app-buses-in-progress',
  templateUrl: './buses-in-progress.component.html',
  styleUrls: ['./buses-in-progress.component.scss']
})
export class BusesInProgressComponent implements OnInit {
  @Input() busesInProgress: IBusesInProgress;

  public workspaceId$: Observable<string>;

  constructor(private store$: Store<IStore>) { }

  ngOnInit() {
    this.workspaceId$ = this.store$
      .select(state => state.workspaces)
      .map(workspaces => workspaces.selectedWorkspaceId);
  }

  closeSidenavOnSmallScreen() {
    this.store$.dispatch({ type: Ui.CLOSE_SIDENAV_ON_SMALL_SCREEN });
  }
}
