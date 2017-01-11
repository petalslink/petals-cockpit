import { NgModule } from '@angular/core';

import { SharedModule } from './../../../../../shared/shared.module';
import { PetalsServiceUnitViewComponent } from './petals-service-unit-view.component';
import { PetalsServiceUnitViewRoutingModule } from './petals-service-unit-view-routing.module';
import { PetalsServiceUnitOverviewComponent } from './petals-service-unit-overview/petals-service-unit-overview.component';

@NgModule({
  imports: [
    SharedModule,
    PetalsServiceUnitViewRoutingModule
  ],
  declarations: [PetalsServiceUnitViewComponent, PetalsServiceUnitOverviewComponent]
})
export class PetalsServiceUnitViewModule { }
