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
import { Subject } from 'rxjs/Subject';

import { IStore } from '../../../../../shared/interfaces/store.interface';
import { Ui } from '../../../../../shared/state/ui.reducer';
import { ServiceUnits } from '../../state/service-units/service-units.reducer';
import { getCurrentServiceUnit } from '../../state/service-units/service-units.selectors';
import { IServiceUnitRow } from '../../state/service-units/service-unit.interface';

@Component({
  selector: 'app-petals-service-unit-view',
  templateUrl: './petals-service-unit-view.component.html',
  styleUrls: ['./petals-service-unit-view.component.scss']
})
export class PetalsServiceUnitViewComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  public serviceUnit$: Observable<IServiceUnitRow>;

  constructor(private store$: Store<IStore>, private route: ActivatedRoute) { }

  ngOnInit() {
    const serviceUnitId$ = this.route.paramMap
      .map(pm => pm.get('serviceUnitId'))
      .distinctUntilChanged();

    this.serviceUnit$ = this.store$.let(getCurrentServiceUnit);

    this.store$.dispatch({ type: Ui.SET_TITLES, payload: { titleMainPart1: 'Petals', titleMainPart2: 'Service Unit' } });

    serviceUnitId$
      .takeUntil(this.onDestroy$)
      .subscribe(serviceUnitId => {
        this.store$.dispatch({ type: ServiceUnits.SET_CURRENT_SERVICE_UNIT, payload: { serviceUnitId } });
        this.store$.dispatch({ type: ServiceUnits.FETCH_SERVICE_UNIT_DETAILS, payload: { serviceUnitId } });
      });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();

    this.store$.dispatch({ type: ServiceUnits.SET_CURRENT_SERVICE_UNIT, payload: { serviceUnitId: '' } });
  }
}
