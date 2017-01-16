import { NgModule } from '@angular/core';

import { SharedModule } from '../../../../../shared/shared.module';
import { PetalsComponentViewComponent } from './petals-component-view.component';
import { PetalsComponentViewRoutingModule } from './petals-component-view-routing.module';
import { PetalsComponentOverviewComponent } from './petals-component-overview/petals-component-overview.component';

@NgModule({
  imports: [
    SharedModule,
    PetalsComponentViewRoutingModule
  ],
  declarations: [PetalsComponentViewComponent, PetalsComponentOverviewComponent]
})
export class PetalsComponentViewModule { }
