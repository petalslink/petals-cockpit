import { NgModule } from '@angular/core';

import { SharedModule } from '../../../../shared/shared.module';
import { ServiceContentRoutingModule } from './service-content-routing.module';
import { PetalsServiceContentComponent } from './petals-service-content/petals-service-content.component';

@NgModule({
  imports: [
    SharedModule,
    ServiceContentRoutingModule
  ],
  declarations: [PetalsServiceContentComponent]
})
export class ServiceContentModule { }
