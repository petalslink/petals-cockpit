/**
 * Copyright (C) 2016 Linagora
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

// angular modules
import { Component, Input } from '@angular/core';

// ngrx - store
import { Store } from '@ngrx/store';

// our interfaces
import { IServiceUnit } from '../../../../../../shared-module/interfaces/petals.interface';

// our actions
import { ConfigActions } from '../../../../../../shared-module/reducers/config.actions';

// // our interfaces
import { IStore } from '../../../../../../shared-module/interfaces/store.interface';

@Component({
  selector: 'app-service-units-menu',
  templateUrl: 'petals-service-units-menu.component.html',
  styleUrls: ['petals-service-units-menu.component.scss']
})
export class ServiceUnitsMenuComponent {
  @Input() serviceUnits: Array<IServiceUnit>;
  @Input() search: string;

  @Input() idBus: number;
  @Input() idContainer: number;
  @Input() idComponent: number;

  @Input() idWorkspaceSelected: string;
  @Input() idServiceUnitSelected: string;

  constructor(private store$: Store<IStore>) { }

  generateLink(serviceUnitId) {
    return [
      '/cockpit',
      'workspaces', this.idWorkspaceSelected,
      'petals', 'bus', this.idBus,
      'container', this.idContainer,
      'component', this.idComponent,
      'serviceUnit', serviceUnitId
    ].join('/');
  }

  closeSidenavMobile() {
    this.store$.dispatch({ type: ConfigActions.CLOSE_SIDENAV_IF_MOBILE });
  }
}
