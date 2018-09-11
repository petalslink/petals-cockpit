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

import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { stateToLedColor } from '@shared/helpers/shared.helper';
import { ComponentState } from '@shared/services/components.service';
import { IStore } from '@shared/state/store.interface';
import { IComponentWithSLsAndSUs } from '@wks/state/components/components.selectors';
import { IServiceUnitRow } from '@wks/state/service-units/service-units.interface';
import { ISharedLibraryRow } from '@wks/state/shared-libraries/shared-libraries.interface';

@Component({
  selector: 'app-petals-component-overview',
  templateUrl: './petals-component-overview.component.html',
  styleUrls: ['./petals-component-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetalsComponentOverviewComponent implements OnInit {
  @Input() component: IComponentWithSLsAndSUs;
  @Input() workspaceId: string;

  public workspaceId$: Observable<string>;

  constructor(private store$: Store<IStore>) {}

  ngOnInit() {
    this.workspaceId$ = this.store$.pipe(
      select(state => state.workspaces.selectedWorkspaceId)
    );
  }

  trackBySl(i: number, sl: ISharedLibraryRow) {
    return sl.id;
  }

  trackBySu(i: number, su: IServiceUnitRow) {
    return su.id;
  }

  getLedColorFromState(state: ComponentState) {
    return stateToLedColor(state);
  }
}
