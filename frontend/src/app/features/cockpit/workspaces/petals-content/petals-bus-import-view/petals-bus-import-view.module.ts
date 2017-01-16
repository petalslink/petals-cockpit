import { NgModule } from '@angular/core';

import { SharedModule } from './../../../../../shared/shared.module';
import { PetalsBusImportViewRoutingModule } from './petals-bus-import-view-routing.module';
import { PetalsBusImportViewComponent } from './petals-bus-import-view.component';

@NgModule({
  imports: [
    SharedModule,
    PetalsBusImportViewRoutingModule
  ],
  declarations: [PetalsBusImportViewComponent]
})
export class PetalsBusImportViewModule { }
