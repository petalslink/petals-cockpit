// angular modules
import { NgModule } from '@angular/core';

// our components
import { PetalsModuleComponent } from './petals-module.component';
import { SharedModule } from '../../../../shared-module/shared-module.module';
import { PetalsContentModule } from './petals-content-module/petals-content-module.module';

@NgModule({
  imports: [
    SharedModule,
    PetalsContentModule
  ],
  declarations: [
    PetalsModuleComponent
  ]
})
export class PetalsModule { }
