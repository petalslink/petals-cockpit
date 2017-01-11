import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiMenuRoutingModule } from './api-menu-routing.module';
import { ApiMenuViewComponent } from './api-menu-view/api-menu-view.component';

@NgModule({
  imports: [
    CommonModule,
    ApiMenuRoutingModule
  ],
  declarations: [ApiMenuViewComponent]
})
export class ApiMenuModule { }
