import { NgModule } from '@angular/core';
import { ServiceContentModuleComponent } from './service-content-module.component';
import { SharedModule } from '../../../../../shared-module/shared-module.module';

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [
    ServiceContentModuleComponent
  ],
  exports: [
    ServiceContentModuleComponent
  ]
})
export class ServiceContentModule { }
