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

import { SharedModule } from '@shared/shared.module';
import { PetalsMenuModule } from '@wks/petals-menu/petals-menu.module';
import { ServicesMenuModule } from '@wks/services-menu/services-menu.module';
import { WorkspaceOverviewModule } from '@wks/workspace-overview/workspace-overview.module';
import { WorkspaceRoutingModule } from './workspace-routing.module';

import {
  DeletedWorkspaceDialogComponent,
  WorkspaceComponent,
} from './workspace.component';

@NgModule({
  imports: [
    SharedModule,
    WorkspaceOverviewModule,
    PetalsMenuModule,
    ServicesMenuModule,
    WorkspaceRoutingModule,
  ],
  declarations: [WorkspaceComponent, DeletedWorkspaceDialogComponent],
  entryComponents: [DeletedWorkspaceDialogComponent],
})
export class WorkspaceModule {}
