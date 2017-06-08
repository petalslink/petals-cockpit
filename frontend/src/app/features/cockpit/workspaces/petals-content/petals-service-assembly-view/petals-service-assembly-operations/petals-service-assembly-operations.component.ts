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

import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { Store } from '@ngrx/store';

import { stateNameToPossibleActionsServiceAssembly } from '../../../../../../shared/helpers/service-assembly.helper';
import { IStore } from '../../../../../../shared/interfaces/store.interface';
import { IServiceAssemblyRow } from 'app/features/cockpit/workspaces/state/service-assemblies/service-assemblies.interface';
import { ServiceAssemblies } from 'app/features/cockpit/workspaces/state/service-assemblies/service-assemblies.reducer';
import { ServiceAssemblyState } from 'app/shared/services/service-assemblies.service';

@Component({
  selector: 'app-petals-service-assembly-operations',
  templateUrl: './petals-service-assembly-operations.component.html',
  styleUrls: ['./petals-service-assembly-operations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetalsServiceAssemblyOperationsComponent implements OnInit {
  @Input() serviceAssembly: IServiceAssemblyRow;

  constructor(private store$: Store<IStore>) {}

  ngOnInit() {}

  getPossibleStateActions(state: ServiceAssemblyState) {
    return stateNameToPossibleActionsServiceAssembly(state);
  }

  saState(index, item) {
    return item.newStateAction;
  }

  changeState(newState: ServiceAssemblyState) {
    this.store$.dispatch({
      type: ServiceAssemblies.CHANGE_STATE,
      payload: { serviceAssemblyId: this.serviceAssembly.id, newState },
    });
  }
}
