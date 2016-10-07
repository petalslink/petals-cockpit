import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceMenuModuleComponent } from './service-menu-module.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    ServiceMenuModuleComponent
  ],
  exports: [
    ServiceMenuModuleComponent
  ]
})
export class ServiceMenuModule { }
