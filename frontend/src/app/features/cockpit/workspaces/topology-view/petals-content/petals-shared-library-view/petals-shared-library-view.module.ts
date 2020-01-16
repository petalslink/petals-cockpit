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
import { WorkspaceSharedModule } from '@wks/workspace/workspace-shared.module';
import { PetalsSharedLibraryViewRoutingModule } from './petals-shared-library-view-routing.module';

import { PetalsSharedLibraryOperationsComponent } from './petals-shared-library-operations/petals-shared-library-operations.component';
import { PetalsSharedLibraryOverviewComponent } from './petals-shared-library-overview/petals-shared-library-overview.component';
import { PetalsSharedLibraryViewComponent } from './petals-shared-library-view.component';
@NgModule({
  imports: [
    SharedModule,
    PetalsSharedLibraryViewRoutingModule,
    WorkspaceSharedModule,
  ],
  declarations: [
    PetalsSharedLibraryViewComponent,
    PetalsSharedLibraryOverviewComponent,
    PetalsSharedLibraryOperationsComponent,
  ],
})
export class PetalsSharedLibraryViewModule {}
