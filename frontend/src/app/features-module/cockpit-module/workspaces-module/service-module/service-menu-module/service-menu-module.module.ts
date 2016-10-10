import { NgModule } from '@angular/core';
import { ServiceMenuModuleComponent } from './service-menu-module.component';
import { SharedModule } from '../../../../../shared-module/shared-module.module';

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [
    ServiceMenuModuleComponent
  ],
  exports: [
    ServiceMenuModuleComponent
  ]
})
export class ServiceMenuModule { }
