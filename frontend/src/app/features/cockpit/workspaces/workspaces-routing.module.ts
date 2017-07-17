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

import {
  WorkspacesComponent,
  NoWorkspaceComponent,
} from './workspaces.component';
import { WorkspaceResolver } from './workspace-resolver';

// /workspaces
const routes: Routes = [
  {
    path: '',
    component: WorkspacesComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: NoWorkspaceComponent,
      },
      {
        path: ':workspaceId',
        // as we use the store to retrieve our data, no need to pass them
        // using resolve, but we still need to call the resolver to make sure
        // they're available before displaying the view
        resolve: { _: WorkspaceResolver },
        loadChildren:
          'app/features/cockpit/workspaces/workspace/workspace.module#WorkspaceModule',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class WorkspacesRoutingModule {}
