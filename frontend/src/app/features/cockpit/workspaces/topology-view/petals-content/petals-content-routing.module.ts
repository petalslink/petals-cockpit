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

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PetalsByIdGuard } from './petals-by-id.guard';

// /workspaces/:workspaceId/petals
const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
  },
  {
    path: 'buses/:busId',
    loadChildren:
      './petals-bus-view/petals-bus-view.module#PetalsBusViewModule',
  },
  {
    path: 'containers/:containerId',
    loadChildren:
      './petals-container-view/petals-container-view.module#PetalsContainerViewModule',
  },
  {
    path: 'service-assemblies/:serviceAssemblyId',
    loadChildren:
      './petals-service-assembly-view/petals-service-assembly-view.module#PetalsServiceAssemblyViewModule',
  },
  {
    path: 'components/:componentId',
    loadChildren:
      './petals-component-view/petals-component-view.module#PetalsComponentViewModule',
  },
  {
    path: 'service-units/:serviceUnitId',
    loadChildren:
      './petals-service-unit-view/petals-service-unit-view.module#PetalsServiceUnitViewModule',
  },
  {
    path: 'shared-libraries/:sharedLibraryId',
    loadChildren:
      './petals-shared-library-view/petals-shared-library-view.module#PetalsSharedLibraryViewModule',
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: '', canActivateChild: [PetalsByIdGuard], children: routes },
    ]),
  ],
  providers: [PetalsByIdGuard],
})
export class PetalsContentRoutingModule {}
