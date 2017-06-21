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
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';

import { IServiceUnitRow } from '../../../state/service-units/service-units.interface';
import { IStore } from '../../../../../../shared/state/store.interface';
import { IServiceAssemblyRow } from 'app/features/cockpit/workspaces/state/service-assemblies/service-assemblies.interface';
import { isLargeScreen } from 'app/shared/state/ui.selectors';

@Component({
  selector: 'app-petals-service-unit-overview',
  templateUrl: './petals-service-unit-overview.component.html',
  styleUrls: ['./petals-service-unit-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetalsServiceUnitOverviewComponent implements OnInit {
  public btnByScreenSize$: Observable<string>;

  @Input() serviceUnit: IServiceUnitRow;
  @Input() serviceAssembly: IServiceAssemblyRow;
  @Input() workspaceId: string;

  constructor(private store$: Store<IStore>) {}

  ngOnInit() {
    this.btnByScreenSize$ = this.store$
      .let(isLargeScreen)
      .map(ls => (ls ? `mat-raised-button` : `mat-mini-fab`));
  }
}
