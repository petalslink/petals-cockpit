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

import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Store } from '@ngrx/store';

import { IServiceUnitRow, ServiceUnitState } from '../../../state/service-units/service-unit.interface';
import { stateNameToPossibleActionsServiceUnit } from '../../../../../../shared/helpers/service-unit.helper';
import { IStore } from '../../../../../../shared/interfaces/store.interface';
import { ServiceUnits } from '../../../state/service-units/service-units.reducer';

@Component({
  selector: 'app-petals-service-unit-overview',
  templateUrl: './petals-service-unit-overview.component.html',
  styleUrls: ['./petals-service-unit-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PetalsServiceUnitOverviewComponent implements OnInit {
  @Input() serviceUnit: IServiceUnitRow;

  constructor(private store$: Store<IStore>) { }

  ngOnInit() { }

  getPossibleStateActions(state: ServiceUnitState) {
    return stateNameToPossibleActionsServiceUnit(state);
  }

  suState(index, item) {
    return this.serviceUnit ? this.serviceUnit.state : null;
  }

  changeState(newState: ServiceUnitState) {
    this.store$.dispatch({ type: ServiceUnits.CHANGE_STATE, payload: { serviceUnitId: this.serviceUnit.id, newState } });
  }
}
