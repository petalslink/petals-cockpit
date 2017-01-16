import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PetalsBusImportViewComponent } from './petals-bus-import-view.component';

// /workspaces/:workspaceId/petals/buses/import
const routes: Routes = [
  {
    path: '',
    component: PetalsBusImportViewComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class PetalsBusImportViewRoutingModule { }
