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

import { SharedModule } from '../../../../../shared/shared.module';

import { PetalsServiceAssemblyOperationsComponent } from 'app/features/cockpit/workspaces/petals-content/petals-service-assembly-view/petals-service-assembly-operations/petals-service-assembly-operations.component';
import { PetalsServiceAssemblyOverviewComponent } from 'app/features/cockpit/workspaces/petals-content/petals-service-assembly-view/petals-service-assembly-overview/petals-service-assembly-overview.component';
import { PetalsServiceAssemblyViewRoutingModule } from 'app/features/cockpit/workspaces/petals-content/petals-service-assembly-view/petals-service-assembly-view-routing.module';
import { PetalsServiceAssemblyViewComponent } from 'app/features/cockpit/workspaces/petals-content/petals-service-assembly-view/petals-service-assembly-view.component';
import { WorkspaceSharedModule } from 'app/features/cockpit/workspaces/workspace/workspace-shared.module';

@NgModule({
  imports: [
    SharedModule,
    PetalsServiceAssemblyViewRoutingModule,
    WorkspaceSharedModule,
  ],
  declarations: [
    PetalsServiceAssemblyViewComponent,
    PetalsServiceAssemblyOverviewComponent,
    PetalsServiceAssemblyOperationsComponent,
  ],
})
export class PetalsServiceAssemblyViewModule {}
