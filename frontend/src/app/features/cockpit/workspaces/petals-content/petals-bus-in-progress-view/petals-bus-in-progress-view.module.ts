import { NgModule } from '@angular/core';

import { SharedModule } from '../../../../../shared/shared.module';
import { PetalsBusInProgressViewRoutingModule } from './petals-bus-in-progress-view-routing.module';
import { PetalsBusInProgressViewComponent } from './petals-bus-in-progress-view.component';

@NgModule({
  imports: [
    SharedModule,
    PetalsBusInProgressViewRoutingModule
  ],
  declarations: [PetalsBusInProgressViewComponent]
})
export class PetalsBusInProgressViewModule { }
