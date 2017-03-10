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

import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';

import { IContainerRow } from '../../../state/containers/container.interface';
import { IStore } from './../../../../../../shared/interfaces/store.interface';
import { arrayEquals } from '../../../../../../shared/helpers/shared.helper';

@Component({
  selector: 'app-petals-container-overview',
  templateUrl: './petals-container-overview.component.html',
  styleUrls: ['./petals-container-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PetalsContainerOverviewComponent implements OnInit {
  public idWorkspace$: Observable<string>;
  public containers$: Observable<IContainerRow[]>;

  @Input() container: IContainerRow;

  constructor(private store$: Store<IStore>) { }

  ngOnInit() {
    this.idWorkspace$ = this.store$.select(state => state.workspaces.selectedWorkspaceId);
    this.containers$ = this.store$
      .select(state => {
        const busId = state.buses.allIds
          .find(bId => state.buses.byId[bId].containers.includes(state.containers.selectedContainerId));
        return state.buses.byId[busId].containers
          .filter(id => id !== state.containers.selectedContainerId)
          .map(id => state.containers.byId[id]);
      })
      .distinctUntilChanged(arrayEquals);
  }

  isReachable(id: string): boolean {
    return this.container.reachabilities.includes(id);
  }
}
