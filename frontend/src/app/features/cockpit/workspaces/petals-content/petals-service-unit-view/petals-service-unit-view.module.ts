/**
 * Copyright (C) 2017-2018 Linagora
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

import { WorkspaceSharedModule } from 'app/features/cockpit/workspaces/workspace/workspace-shared.module';
import { SharedModule } from 'app/shared/shared.module';
import { PetalsServiceUnitOverviewComponent } from './petals-service-unit-overview/petals-service-unit-overview.component';
import { PetalsServiceUnitViewRoutingModule } from './petals-service-unit-view-routing.module';
import { PetalsServiceUnitViewComponent } from './petals-service-unit-view.component';

@NgModule({
  imports: [
    SharedModule,
    PetalsServiceUnitViewRoutingModule,
    WorkspaceSharedModule,
  ],
  declarations: [
    PetalsServiceUnitViewComponent,
    PetalsServiceUnitOverviewComponent,
  ],
})
export class PetalsServiceUnitViewModule {}
