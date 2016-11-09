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
import { PetalsContentModuleComponent } from './petals-content-module.component';
import { PetalsBusContentComponent } from './petals-bus-content/petals-bus-content.component';
import { PetalsContainerContentComponent } from './petals-container-content/petals-container-content.component';
import { PetalsComponentContentComponent } from './petals-component-content/petals-component-content.component';
import { PetalsServiceUnitContentComponent } from './petals-service-unit-content/petals-service-unit-content.component';
import { PetalsBusImportComponent } from './petals-bus-content/petals-bus-import/petals-bus-import.component';
import { BusOverviewComponent } from './petals-bus-content/bus-overview/bus-overview.component';
import { BusConfigComponent } from './petals-bus-content/bus-config/bus-config.component';

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [
    PetalsContentModuleComponent,
    PetalsBusContentComponent,
    PetalsContainerContentComponent,
    PetalsComponentContentComponent,
    PetalsServiceUnitContentComponent,
    PetalsBusImportComponent,
    BusOverviewComponent,
    BusConfigComponent
  ],
  exports: [
    PetalsContentModuleComponent
  ]
})
export class PetalsContentModule { }
