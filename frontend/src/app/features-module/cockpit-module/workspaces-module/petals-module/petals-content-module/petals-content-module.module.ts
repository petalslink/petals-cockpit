import { NgModule } from '@angular/core';
import { PetalsContentModuleComponent } from './petals-content-module.component';
import { SharedModule } from '../../../../../shared-module/shared-module.module';
import { PetalsBusContentComponent } from './petals-bus-content/petals-bus-content.component';
import { PetalsContainerContentComponent } from './petals-container-content/petals-container-content.component';
import { PetalsComponentContentComponent } from './petals-component-content/petals-component-content.component';
import { PetalsServiceUnitContentComponent } from './petals-service-unit-content/petals-service-unit-content.component';

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [
    PetalsContentModuleComponent,
    PetalsBusContentComponent,
    PetalsContainerContentComponent,
    PetalsComponentContentComponent,
    PetalsServiceUnitContentComponent
  ],
  exports: [
    PetalsContentModuleComponent
  ]
})
export class PetalsContentModule { }
