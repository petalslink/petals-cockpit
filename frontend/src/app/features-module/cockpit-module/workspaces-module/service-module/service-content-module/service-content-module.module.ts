import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceContentModuleComponent } from './service-content-module.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    ServiceContentModuleComponent
  ],
  exports: [
    ServiceContentModuleComponent
  ]
})
export class ServiceContentModule { }
