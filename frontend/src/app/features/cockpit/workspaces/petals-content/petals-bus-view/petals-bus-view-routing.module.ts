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

import { PetalsBusViewComponent } from './petals-bus-view.component';

// /workspaces/:workspaceId/petals/buses/:busId
const routes: Routes = [
  {
    path: '',
    component: PetalsBusViewComponent
    // when we'll be able to use router-outlet with material2 tabs
    // https://github.com/angular/material2/issues/524
    // load every tab content separately
    // children: [
    //   {
    //     path: '',
    //     redirectTo: 'overview',
    //   },
    //   {
    //     path: 'overview',
    //     loadChildren:
    //   }
    // ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class PetalsBusViewRoutingModule { }
