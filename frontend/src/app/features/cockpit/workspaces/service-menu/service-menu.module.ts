import { NgModule } from '@angular/core';

import { SharedModule } from '../../../../shared/shared.module';
import { ServiceMenuRoutingModule } from './service-menu-routing.module';
import { PetalsServiceMenuComponent } from './petals-service-menu/petals-service-menu.component';

@NgModule({
  imports: [
    SharedModule,
    ServiceMenuRoutingModule
  ],
  declarations: [PetalsServiceMenuComponent]
})
export class ServiceMenuModule { }
