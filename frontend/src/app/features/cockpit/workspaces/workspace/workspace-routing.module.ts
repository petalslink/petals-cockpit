/**
 * Copyright (C) 2017-2019 Linagora
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

// import { NotFound404Component } from '@shared/components/not-found-404/not-found-404.component';

import { WorkspaceOverviewComponent } from '@feat/cockpit/workspaces/workspace-overview/workspace-overview.component';
import { WorkspaceComponent } from './workspace.component';

const routes: Routes = [
  {
    path: '',
    component: WorkspaceComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: WorkspaceOverviewComponent,
      },
      {
        path: 'petals',
        loadChildren:
          '@wks/topology-view/topology-view.module#TopologyViewModule',
      },
      {
        path: 'services',
        loadChildren:
          '@wks/services-view/services-view.module#ServicesViewModule',
      },
      {
        path: '**',
        redirectTo: '',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class WorkspaceRoutingModule {}
