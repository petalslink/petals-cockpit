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

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ServicesByIdGuard } from './services-by-id.guard';

// /workspaces/:workspaceId/services
const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'services',
  },
  {
    path: 'interfaces/:interfaceId',
    loadChildren:
      './services-interface-view/services-interface-view.module#ServicesInterfaceViewModule',
  },
  {
    path: 'services/:serviceId',
    loadChildren:
      './services-service-view/services-service-view.module#ServicesServiceViewModule',
  },
  {
    path: 'endpoints/:endpointId',
    loadChildren:
      './services-endpoint-view/services-endpoint-view.module#ServicesEndpointViewModule',
  },
];

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: '', canActivateChild: [ServicesByIdGuard], children: routes },
    ]),
  ],
  providers: [ServicesByIdGuard],
})
export class ServicesContentRoutingModule {}
