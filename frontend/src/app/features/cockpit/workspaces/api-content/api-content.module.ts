import { NgModule } from '@angular/core';

import { SharedModule } from './../../../../shared/shared.module';
import { ApiContentRoutingModule } from './api-content-routing.module';
import { ApiContentViewComponent } from './api-content-view/api-content-view.component';

@NgModule({
  imports: [
    SharedModule,
    ApiContentRoutingModule
  ],
  declarations: [ApiContentViewComponent]
})
export class ApiContentModule { }
