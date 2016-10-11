import { NgModule } from '@angular/core';
import { ApiMenuModuleComponent } from './api-menu-module.component';
import { SharedModule } from '../../../../../shared-module/shared-module.module';

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [
    ApiMenuModuleComponent
  ],
  exports: [
    ApiMenuModuleComponent
  ]
})
export class ApiMenuModule { }
