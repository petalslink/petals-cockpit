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

import { CockpitComponent } from './cockpit.component';
// import { EmptyMenuComponent } from './empty-menu/empty-menu.component';
import { WorkspacesModule } from './workspaces/workspaces.module';
// import { PetalsContentModule } from './workspaces/petals-content/petals-content.module';

export function loadWorkspacesModule() {
  return WorkspacesModule;
}

// export function loadPetalsContentModule() {
//   return PetalsContentModule;
// }

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/workspaces'
  },
  {
    path: '',
    component: CockpitComponent,
    children: [
      {
        path: 'workspaces',
        // loadChildren: loadWorkspacesModule
        loadChildren: 'app/features/cockpit/workspaces/workspaces.module#WorkspacesModule'
      }
      // {
      //   path: '',
      //   component: EmptyMenuComponent,
      //   outlet: 'aux'
      // }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class CockpitRoutingModule { }