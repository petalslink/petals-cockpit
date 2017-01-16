import { NgModule } from '@angular/core';

import { SharedModule } from '../../../../../shared/shared.module';
import { PetalsBusViewRoutingModule } from './petals-bus-view-routing.module';
import { PetalsBusViewComponent } from './petals-bus-view.component';
import { PetalsBusOverviewComponent } from './petals-bus-overview/petals-bus-overview.component';

@NgModule({
  imports: [
    SharedModule,
    PetalsBusViewRoutingModule
  ],
  declarations: [PetalsBusViewComponent, PetalsBusOverviewComponent]
})
export class PetalsBusViewModule { }
