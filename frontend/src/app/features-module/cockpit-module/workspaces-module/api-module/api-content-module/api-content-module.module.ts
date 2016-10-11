import { NgModule } from '@angular/core';
import { ApiContentModuleComponent } from './api-content-module.component';
import { SharedModule } from '../../../../../shared-module/shared-module.module';

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [
    ApiContentModuleComponent
  ],
  exports: [
    ApiContentModuleComponent
  ]
})
export class ApiContentModule { }
