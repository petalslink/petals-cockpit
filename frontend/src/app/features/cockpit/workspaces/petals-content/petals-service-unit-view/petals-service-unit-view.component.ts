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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { IStore } from '../../../../../shared/state/store.interface';
import {
  getCurrentServiceUnit,
  IServiceUnitWithSA,
} from '../../state/service-units/service-units.selectors';

import { ServiceUnits } from 'app/features/cockpit/workspaces/state/service-units/service-units.actions';
import { deletable, IDeletable } from 'app/shared/operators/deletable.operator';
import { Ui } from 'app/shared/state/ui.actions';

@Component({
  selector: 'app-petals-service-unit-view',
  templateUrl: './petals-service-unit-view.component.html',
  styleUrls: ['./petals-service-unit-view.component.scss'],
})
export class PetalsServiceUnitViewComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  serviceUnit$: Observable<IDeletable<IServiceUnitWithSA>>;
  workspaceId$: Observable<string>;

  constructor(private store$: Store<IStore>, private route: ActivatedRoute) {}

  ngOnInit() {
    const serviceUnitId$ = this.route.paramMap
      .map(pm => pm.get('serviceUnitId'))
      .distinctUntilChanged();

    this.serviceUnit$ = this.store$.let(getCurrentServiceUnit).let(deletable);

    this.store$.dispatch(
      new Ui.SetTitles({
        titleMainPart1: 'Petals',
        titleMainPart2: 'Service Unit',
      })
    );

    serviceUnitId$
      .takeUntil(this.onDestroy$)
      .do(id => {
        this.store$.dispatch(new ServiceUnits.SetCurrent({ id }));
        this.store$.dispatch(new ServiceUnits.FetchDetails({ id }));
      })
      .finally(() =>
        this.store$.dispatch(new ServiceUnits.SetCurrent({ id: '' }))
      )
      .subscribe();

    this.workspaceId$ = this.store$.select(
      state => state.workspaces.selectedWorkspaceId
    );
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
