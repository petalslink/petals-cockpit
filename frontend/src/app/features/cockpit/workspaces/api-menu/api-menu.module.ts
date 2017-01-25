import { NgModule } from '@angular/core';

import { SharedModule } from './../../../../shared/shared.module';
import { ApiMenuRoutingModule } from './api-menu-routing.module';
import { ApiMenuViewComponent } from './api-menu-view/api-menu-view.component';

@NgModule({
  imports: [
    SharedModule,
    ApiMenuRoutingModule
  ],
  declarations: [ApiMenuViewComponent]
})
export class ApiMenuModule { }
