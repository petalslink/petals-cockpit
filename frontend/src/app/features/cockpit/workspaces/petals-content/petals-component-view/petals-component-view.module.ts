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
import { PetalsComponentViewRoutingModule } from './petals-component-view-routing.module';

import { PetalsComponentOperationsComponent } from './petals-component-operations/petals-component-operations.component';
import { PetalsComponentOverviewComponent } from './petals-component-overview/petals-component-overview.component';
import { PetalsComponentViewComponent } from './petals-component-view.component';

@NgModule({
  imports: [
    SharedModule,
    PetalsComponentViewRoutingModule,
    WorkspaceSharedModule,
  ],
  declarations: [
    PetalsComponentViewComponent,
    PetalsComponentOverviewComponent,
    PetalsComponentOperationsComponent,
  ],
})
export class PetalsComponentViewModule {}
