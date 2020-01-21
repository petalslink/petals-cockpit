/**
 * Copyright (C) 2017-2020 Linagora
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

import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { ServiceAssemblies } from '@feat/cockpit/workspaces/state/service-assemblies/service-assemblies.actions';
import { IServiceUnitRow } from '@feat/cockpit/workspaces/state/service-units/service-units.interface';
import { stateNameToPossibleActionsServiceAssembly } from '@shared/helpers/service-assembly.helper';
import { stateToLedColor } from '@shared/helpers/shared.helper';
import { ServiceAssemblyState } from '@shared/services/service-assemblies.service';
import { IStore } from '@shared/state/store.interface';
import {
  getCurrentServiceAssembly,
  IServiceAssemblyWithSUsAndComponents,
} from '@wks/state/service-assemblies/service-assemblies.selectors';

@Component({
  selector: 'app-petals-service-assembly-view',
  templateUrl: './petals-service-assembly-view.component.html',
  styleUrls: ['./petals-service-assembly-view.component.scss'],
})
export class PetalsServiceAssemblyViewComponent implements OnInit {
  serviceAssembly$: Observable<IServiceAssemblyWithSUsAndComponents>;
  workspaceId$: Observable<string>;

  constructor(private store$: Store<IStore>) {}

  ngOnInit() {
    this.serviceAssembly$ = this.store$.pipe(select(getCurrentServiceAssembly));

    this.workspaceId$ = this.store$.pipe(
      select(state => state.workspaces.selectedWorkspaceId)
    );
  }

  trackBySu(i: number, su: IServiceUnitRow) {
    return su.id;
  }

  getLedColorFromState(state: ServiceAssemblyState) {
    return stateToLedColor(state);
  }

  getPossibleStateActions(state: ServiceAssemblyState) {
    return stateNameToPossibleActionsServiceAssembly(state);
  }

  trackBySaState(index: number, item: any) {
    return item.newStateAction;
  }

  changeState(saId: string, state: ServiceAssemblyState) {
    this.store$.dispatch(
      new ServiceAssemblies.ChangeState({
        id: saId,
        state,
      })
    );
  }
}
