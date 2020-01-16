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

import { SharedModule } from '@shared/shared.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { WorkspacesRoutingModule } from './workspaces-routing.module';

import { WorkspacesCreateComponent } from './workspaces-create/workspaces-create.component';
import { WorkspacesListComponent } from './workspaces-list/workspaces-list.component';
import { WorkspacesComponent } from './workspaces.component';

@NgModule({
  imports: [SharedModule, WorkspacesRoutingModule, WorkspaceModule],
  declarations: [
    WorkspacesComponent,
    WorkspacesListComponent,
    WorkspacesCreateComponent,
  ],
})
export class WorkspacesModule {}
