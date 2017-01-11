import { NgModule } from '@angular/core';

import { SharedModule } from './../../../../shared/shared.module';
import { PetalsContentRoutingModule } from './petals-content-routing.module';
import { PetalsContentViewComponent } from './petals-content.component';

@NgModule({
  imports: [
    SharedModule,
    PetalsContentRoutingModule
  ],
  declarations: [PetalsContentViewComponent]
})
export class PetalsContentModule { }
