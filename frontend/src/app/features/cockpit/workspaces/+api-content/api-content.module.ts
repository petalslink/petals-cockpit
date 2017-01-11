import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiContentRoutingModule } from './api-content-routing.module';
import { ApiContentViewComponent } from './api-content-view/api-content-view.component';

@NgModule({
  imports: [
    CommonModule,
    ApiContentRoutingModule
  ],
  declarations: [ApiContentViewComponent]
})
export class ApiContentModule { }
