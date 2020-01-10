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

import { EndpointsListComponent } from './endpoints-list/endpoints-list.component';
import { InterfacesListComponent } from './interfaces-list/interfaces-list.component';
import { ServicesListComponent } from './services-list/services-list.component';
import { ServicesMenuViewComponent } from './services-menu-view/services-menu-view.component';

@NgModule({
  imports: [SharedModule],
  declarations: [
    ServicesMenuViewComponent,
    ServicesListComponent,
    EndpointsListComponent,
    InterfacesListComponent,
  ],
  exports: [ServicesMenuViewComponent],
})
export class ServicesMenuModule {}
