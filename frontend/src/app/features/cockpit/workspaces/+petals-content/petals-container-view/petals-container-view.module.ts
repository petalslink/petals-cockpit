import { NgModule } from '@angular/core';

import { SharedModule } from './../../../../../shared/shared.module';
import { PetalsContainerViewRoutingModule } from './petals-container-view-routing.module';
import { PetalsContainerViewComponent } from './petals-container-view.component';
import { PetalsContainerOverviewComponent } from './petals-container-overview/petals-container-overview.component';

@NgModule({
  imports: [
    SharedModule,
    PetalsContainerViewRoutingModule
  ],
  declarations: [PetalsContainerViewComponent, PetalsContainerOverviewComponent]
})
export class PetalsContainerViewModule { }
