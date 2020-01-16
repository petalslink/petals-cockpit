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
import { CockpitComponent } from './cockpit.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/workspaces?page=list',
  },
  {
    path: '',
    component: CockpitComponent,
    children: [
      {
        path: 'workspaces',
        loadChildren: './workspaces/workspaces.module#WorkspacesModule',
      },
      {
        path: 'admin',
        loadChildren:
          './administration/administration.module#AdministrationModule',
      },
      {
        path: 'profile',
        loadChildren: './user-profile/user-profile.module#UserProfileModule',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class CockpitRoutingModule {}
