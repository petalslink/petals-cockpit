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

// our modules
import { SharedModule } from '../../../../../shared-module/shared-module.module';

// our components
import { PetalsMenuModuleComponent } from './petals-menu-module.component';
import { PetalsSidenavMenuComponent } from './petals-sidenav-menu/petals-sidenav-menu.component';
import { BusesMenuComponent } from './petals-buses-menu/petals-buses-menu.component';
import { ContainersMenuComponent } from './petals-containers-menu/petals-containers-menu.component';
import { ComponentsMenuComponent } from './petals-components-menu/petals-components-menu.component';
import { ServiceUnitsMenuComponent } from './petals-service-units-menu/petals-service-units-menu.component';

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [
    PetalsMenuModuleComponent,
    PetalsSidenavMenuComponent,
    BusesMenuComponent,
    ContainersMenuComponent,
    ComponentsMenuComponent,
    ServiceUnitsMenuComponent,
  ],
  exports: [
    PetalsMenuModuleComponent
  ]
})
export class PetalsMenuModule { }
