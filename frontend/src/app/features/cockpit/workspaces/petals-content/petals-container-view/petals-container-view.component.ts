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

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { IStore } from '../../../../../shared/interfaces/store.interface';
import { Containers } from '../../state/containers/containers.reducer';
import { Ui } from '../../../../../shared/state/ui.reducer';
import { IContainerRow } from '../../state/containers/container.interface';
import { getCurrentContainer } from '../../state/containers/containers.selectors';

@Component({
  selector: 'app-petals-container-view',
  templateUrl: './petals-container-view.component.html',
  styleUrls: ['./petals-container-view.component.scss']
})
export class PetalsContainerViewComponent implements OnInit, OnDestroy {
  public container$: Observable<IContainerRow>;

  constructor(private _store$: Store<IStore>, private _route: ActivatedRoute) { }

  ngOnInit() {
    this.container$ = this._store$.let(getCurrentContainer());

    this._store$.dispatch({ type: Ui.SET_TITLES, payload: { titleMainPart1: 'Petals', titleMainPart2: 'Container' } });

    this._route
      .params
      .map((params: { workspaceId: string, containerId: string }) => {
        this._store$.dispatch({ type: Containers.SET_CURRENT_CONTAINER, payload: { containerId: params.containerId } });
      })
      .subscribe();
  }

  ngOnDestroy() {
    this._store$.dispatch({ type: Containers.SET_CURRENT_CONTAINER, payload: { containerId: '' } });
  }
}