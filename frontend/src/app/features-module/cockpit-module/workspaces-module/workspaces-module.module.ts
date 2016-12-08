/**
 * Copyright (C) 2016 Linagora
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

// angular modules
import { NgModule } from '@angular/core';

// our components
import { WorkspacesModuleComponent } from './workspaces-module.component';
import { WorkspacesComponent } from './workspaces/workspaces.component';

// our modules
import { SharedModule } from '../../../shared-module/shared-module.module';
import { PetalsModule } from './petals-module/petals-module.module';
import { ServiceModule } from './service-module/service-module.module';
import { ApiModule } from './api-module/api-module.module';
import { WorkspaceComponent } from './workspaces/workspace/workspace.component';

@NgModule({
  imports: [
    SharedModule,
    PetalsModule,
    ServiceModule,
    ApiModule
  ],
  declarations: [
    WorkspacesModuleComponent,
    WorkspacesComponent,
    WorkspaceComponent
  ],
  exports: [
    WorkspacesModuleComponent,
    WorkspacesComponent
  ]
})
export class WorkspacesModule { }
