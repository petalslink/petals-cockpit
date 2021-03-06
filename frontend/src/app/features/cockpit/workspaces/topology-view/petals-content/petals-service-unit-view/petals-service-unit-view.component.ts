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

import { stateToLedColor } from '@shared/helpers/shared.helper';
import { EServiceAssemblyState } from '@shared/services/service-assemblies.service';
import { IStore } from '@shared/state/store.interface';
import {
  getCurrentServiceUnit,
  IServiceUnitWithSaAndComponent,
} from '@wks/state/service-units/service-units.selectors';

@Component({
  selector: 'app-petals-service-unit-view',
  templateUrl: './petals-service-unit-view.component.html',
  styleUrls: ['./petals-service-unit-view.component.scss'],
})
export class PetalsServiceUnitViewComponent implements OnInit {
  serviceUnit$: Observable<IServiceUnitWithSaAndComponent>;
  workspaceId$: Observable<string>;

  constructor(private store$: Store<IStore>) {}

  ngOnInit() {
    this.serviceUnit$ = this.store$.pipe(select(getCurrentServiceUnit));

    this.workspaceId$ = this.store$.pipe(
      select(state => state.workspaces.selectedWorkspaceId)
    );
  }

  getLedColorFromState(state: EServiceAssemblyState) {
    return stateToLedColor(state);
  }
}
