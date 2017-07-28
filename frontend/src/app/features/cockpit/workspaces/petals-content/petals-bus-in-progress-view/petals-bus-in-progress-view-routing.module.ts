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
import { RouterModule, Routes } from '@angular/router';

import { ResourceByIdResolver } from 'app/shared/services/guard-resource-by-id.resolver';
import { PetalsBusInProgressViewComponent } from './petals-bus-in-progress-view.component';

// /workspaces/:workspaceId/petals/buses-in-progress
const routes: Routes = [
  {
    path: '',
    component: PetalsBusInProgressViewComponent,
  },
  {
    path: ':busInProgressId',
    resolve: { _: ResourceByIdResolver },
    component: PetalsBusInProgressViewComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class PetalsBusInProgressViewRoutingModule {}
