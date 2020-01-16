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

import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { Store } from '@ngrx/store';

import { stateNameToPossibleActionsServiceAssembly } from '@shared/helpers/service-assembly.helper';
import { ServiceAssemblyState } from '@shared/services/service-assemblies.service';
import { IStore } from '@shared/state/store.interface';
import { ServiceAssemblies } from '@wks/state/service-assemblies/service-assemblies.actions';
import { IServiceAssemblyRow } from '@wks/state/service-assemblies/service-assemblies.interface';

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

  trackBySaState(index: number, item: any) {
    return item.newStateAction;
  }

  changeState(state: ServiceAssemblyState) {
    this.store$.dispatch(
      new ServiceAssemblies.ChangeState({
        id: this.serviceAssembly.id,
        state,
      })
    );
  }
}
