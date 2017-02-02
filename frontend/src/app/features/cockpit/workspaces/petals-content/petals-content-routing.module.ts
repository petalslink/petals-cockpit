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

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PetalsContentViewComponent } from './petals-content.component';
import { PetalsBusViewModule } from './petals-bus-view/petals-bus-view.module';
import { PetalsBusInProgressViewModule } from './petals-bus-in-progress-view/petals-bus-in-progress-view.module';
import { PetalsContainerViewModule } from './petals-container-view/petals-container-view.module';
import { PetalsComponentViewModule } from './petals-component-view/petals-component-view.module';
import { PetalsServiceUnitViewModule } from './petals-service-unit-view/petals-service-unit-view.module';

export function loadBusInProgressViewModule() {
  return PetalsBusInProgressViewModule;
}

export function loadBusViewModule() {
  return PetalsBusViewModule;
}

export function loadContainerViewModule() {
  return PetalsContainerViewModule;
}

export function loadComponentViewModule() {
  return PetalsComponentViewModule;
}

export function loadServiceUnitViewModule() {
  return PetalsServiceUnitViewModule;
}

// /workspaces/:workspaceId/petals
const routes: Routes = [
  {
    path: '',
    // tslint:disable-next-line:max-line-length
    // loadChildren: loadBusInProgressViewModule
    loadChildren: 'app/features/cockpit/workspaces/petals-content/petals-bus-in-progress-view/petals-bus-in-progress-view.module#PetalsBusInProgressViewModule'
  },
  {
    path: 'buses/:busId',
    // tslint:disable-next-line:max-line-length
    // loadChildren: loadBusViewModule
    loadChildren: 'app/features/cockpit/workspaces/petals-content/petals-bus-view/petals-bus-view.module#PetalsBusViewModule'
  },
  {
    path: 'buses-in-progress',
    // tslint:disable-next-line:max-line-length
    // loadChildren: loadBusInProgressViewModule
    loadChildren: 'app/features/cockpit/workspaces/petals-content/petals-bus-in-progress-view/petals-bus-in-progress-view.module#PetalsBusInProgressViewModule'
  },
  {
    path: 'containers/:containerId',
    // tslint:disable-next-line:max-line-length
    // loadChildren: loadContainerViewModule
    loadChildren: 'app/features/cockpit/workspaces/petals-content/petals-container-view/petals-container-view.module#PetalsContainerViewModule'
  },
  {
    path: 'components/:componentId',
    // tslint:disable-next-line:max-line-length
    // loadChildren: loadComponentViewModule
    loadChildren: 'app/features/cockpit/workspaces/petals-content/petals-component-view/petals-component-view.module#PetalsComponentViewModule'
  },
  {
    path: 'service-units/:serviceUnitId',
    // tslint:disable-next-line:max-line-length
    // loadChildren: loadServiceUnitViewModule
    loadChildren: 'app/features/cockpit/workspaces/petals-content/petals-service-unit-view/petals-service-unit-view.module#PetalsServiceUnitViewModule'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class PetalsContentRoutingModule { }
