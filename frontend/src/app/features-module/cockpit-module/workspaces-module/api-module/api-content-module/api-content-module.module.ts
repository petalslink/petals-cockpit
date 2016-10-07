import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiContentModuleComponent } from './api-content-module.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    ApiContentModuleComponent
  ],
  exports: [
    ApiContentModuleComponent
  ]
})
export class ApiContentModule { }
