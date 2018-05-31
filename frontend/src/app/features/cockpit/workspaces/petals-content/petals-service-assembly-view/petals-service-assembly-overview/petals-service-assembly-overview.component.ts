/**
 * Copyright (C) 2017-2018 Linagora
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
import { Observable } from 'rxjs';

import { IServiceAssemblyWithSUsAndComponents } from 'app/features/cockpit/workspaces/state/service-assemblies/service-assemblies.selectors';
import { IServiceUnitRow } from 'app/features/cockpit/workspaces/state/service-units/service-units.interface';
import { stateToLedColor } from 'app/shared/helpers/shared.helper';
import { ServiceAssemblyState } from 'app/shared/services/service-assemblies.service';
import { IStore } from 'app/shared/state/store.interface';

@Component({
  selector: 'app-petals-service-assembly-overview',
  templateUrl: './petals-service-assembly-overview.component.html',
  styleUrls: ['./petals-service-assembly-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetalsServiceAssemblyOverviewComponent implements OnInit {
  @Input() serviceAssembly: IServiceAssemblyWithSUsAndComponents;
  @Input() workspaceId: string;

  public workspaceId$: Observable<string>;

  constructor(private store$: Store<IStore>) {}

  ngOnInit() {
    this.workspaceId$ = this.store$.select(
      state => state.workspaces.selectedWorkspaceId
    );
  }

  trackBySu(i: number, su: IServiceUnitRow) {
    return su.id;
  }

  getLedColorFromState(state: ServiceAssemblyState) {
    return stateToLedColor(state);
  }
}
