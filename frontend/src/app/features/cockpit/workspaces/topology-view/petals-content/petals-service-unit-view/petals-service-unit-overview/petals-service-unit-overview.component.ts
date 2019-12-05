/**
 * Copyright (C) 2017-2019 Linagora
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
import { map } from 'rxjs/operators';

import { stateToLedColor } from '@shared/helpers/shared.helper';
import { ServiceAssemblyState } from '@shared/services/service-assemblies.service';
import { IStore } from '@shared/state/store.interface';
import { isLargeScreen } from '@shared/state/ui.selectors';
import { IServiceUnitWithSaAndComponent } from '@wks/state/service-units/service-units.selectors';

@Component({
  selector: 'app-petals-service-unit-overview',
  templateUrl: './petals-service-unit-overview.component.html',
  styleUrls: ['./petals-service-unit-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetalsServiceUnitOverviewComponent implements OnInit {
  public btnByScreenSize$: Observable<string>;

  @Input() serviceUnit: IServiceUnitWithSaAndComponent;
  @Input() workspaceId: string;

  constructor(private store$: Store<IStore>) {}

  ngOnInit() {
    this.btnByScreenSize$ = this.store$.pipe(
      isLargeScreen,
      map(ls => (ls ? `mat-raised-button` : `mat-mini-fab`))
    );
  }

  getLedColorFromState(state: ServiceAssemblyState) {
    return stateToLedColor(state);
  }
}
