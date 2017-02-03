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

import { SharedModule } from '../../../shared/shared.module';
import { WorkspacesRoutingModule } from './workspaces-routing.module';
import { WorkspacesComponent } from './workspaces.component';
import { WorkspaceComponent } from './workspace/workspace.component';
import { PetalsMenuModule } from './petals-menu/petals-menu.module';
import { environment } from './../../../../environments/environment';
import { BusesInProgressService } from './../../../shared/services/buses-in-progress.service';
import { BusesInProgressMockService } from './../../../shared/services/buses-in-progress-mock.service';

@NgModule({
  imports: [
    SharedModule,
    WorkspacesRoutingModule,
    PetalsMenuModule
  ],
  declarations: [
    WorkspacesComponent,
    WorkspaceComponent
  ],
  exports: [
    // TODO : Remove this line when aux route becomes available in lazy loaded module
    // we export here to use this component from cockpit.component
    // were we should instead use a router-outlet
    // (in order to lazy load only what's needed)
    PetalsMenuModule
  ]
})
export class WorkspacesModule { }