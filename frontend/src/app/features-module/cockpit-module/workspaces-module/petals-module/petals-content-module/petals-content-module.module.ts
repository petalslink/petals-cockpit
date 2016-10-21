import { NgModule } from '@angular/core';
import { PetalsContentModuleComponent } from './petals-content-module.component';
import { SharedModule } from '../../../../../shared-module/shared-module.module';
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
