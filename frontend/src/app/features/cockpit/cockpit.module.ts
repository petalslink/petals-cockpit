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

import { AdministrationModule } from 'app/features/cockpit/administration/administration.module';
import { SharedModule } from 'app/shared/shared.module';
import { CockpitRoutingModule } from './cockpit-routing.module';
import { CockpitComponent } from './cockpit.component';
import { HeaderComponent } from './header/header.component';
import { WorkspacesModule } from './workspaces/workspaces.module';

@NgModule({
  imports: [
    SharedModule,
    CockpitRoutingModule,
    WorkspacesModule,
    AdministrationModule,
  ],
  declarations: [CockpitComponent, HeaderComponent],
})
export class CockpitModule {}
