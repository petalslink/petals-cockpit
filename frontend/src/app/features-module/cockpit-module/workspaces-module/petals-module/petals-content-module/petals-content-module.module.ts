import { NgModule } from '@angular/core';
import { PetalsContentModuleComponent } from './petals-content-module.component';
import { SharedModule } from '../../../../../shared-module/shared-module.module';

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [PetalsContentModuleComponent],
  exports: [
    PetalsContentModuleComponent
  ]
})
export class PetalsContentModule { }
