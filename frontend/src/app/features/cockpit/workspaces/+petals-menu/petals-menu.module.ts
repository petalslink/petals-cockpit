import { NgModule } from '@angular/core';

import { SharedModule } from '../../../../shared/shared.module';
import { PetalsMenuRoutingModule } from './petals-menu-routing.module';
import { PetalsMenuViewComponent } from './petals-menu-view/petals-menu-view.component';

@NgModule({
  imports: [
    SharedModule,
    PetalsMenuRoutingModule
  ],
  declarations: [PetalsMenuViewComponent]
})
export class PetalsMenuModule { }
