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

import { Components } from '../../state/components/components.reducer';
import { IStore } from '../../../../../shared/interfaces/store.interface';
import { Ui } from '../../../../../shared/state/ui.reducer';
import { IComponentRow } from '../../state/components/component.interface';
import { getCurrentComponent } from '../../state/components/components.selectors';

@Component({
  selector: 'app-petals-component-view',
  templateUrl: './petals-component-view.component.html',
  styleUrls: ['./petals-component-view.component.scss']
})
export class PetalsComponentViewComponent implements OnInit, OnDestroy {
  public component$: Observable<IComponentRow>;

  constructor(private _store$: Store<IStore>, private _route: ActivatedRoute) { }

  ngOnInit() {
    this.component$ = this._store$.let(getCurrentComponent());

    this._store$.dispatch({ type: Ui.SET_TITLES, payload: { titleMainPart1: 'Petals', titleMainPart2: 'Component' } });

    this._route
      .params
      .map((params: { workspaceId: string, componentId: string }) => {
        this._store$.dispatch({ type: Components.SET_CURRENT_COMPONENT, payload: { componentId: params.componentId } });
        this._store$.dispatch({ type: Components.FETCH_COMPONENT_DETAILS, payload: { componentId: params.componentId } });
      })
      .subscribe();
  }

  ngOnDestroy() {
    this._store$.dispatch({ type: Components.SET_CURRENT_COMPONENT, payload: { componentId: '' } });
  }
}
