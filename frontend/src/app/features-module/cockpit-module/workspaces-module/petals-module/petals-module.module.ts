// angular modules
import { NgModule } from '@angular/core';

// our modules
import { SharedModule } from '../../../../shared-module/shared-module.module';
import { PetalsContentModule } from './petals-content-module/petals-content-module.module';

// our components
import { PetalsModuleComponent } from './petals-module.component';

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
