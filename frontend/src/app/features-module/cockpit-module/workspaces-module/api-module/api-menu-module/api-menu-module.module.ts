import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiMenuModuleComponent } from './api-menu-module.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    ApiMenuModuleComponent
  ],
  exports: [
    ApiMenuModuleComponent
  ]
})
export class ApiMenuModule { }
