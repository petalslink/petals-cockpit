import { NgModule } from '@angular/core';

import { SharedModule } from '../../../../shared/shared.module';
import { PetalsMenuRoutingModule } from './petals-menu-routing.module';
import { PetalsMenuViewComponent } from './petals-menu-view/petals-menu-view.component';
import { MaterialTreeComponent } from './material-tree/material-tree.component';
import { BusesInProgressComponent } from './buses-in-progress/buses-in-progress.component';

@NgModule({
  imports: [
    SharedModule,
    // PetalsMenuRoutingModule
  ],
  declarations: [
    PetalsMenuViewComponent,
    MaterialTreeComponent,
    BusesInProgressComponent
  ],
  exports: [PetalsMenuViewComponent]
})
export class PetalsMenuModule { }
