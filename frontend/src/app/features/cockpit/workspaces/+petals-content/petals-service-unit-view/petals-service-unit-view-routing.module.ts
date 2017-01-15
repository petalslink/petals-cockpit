import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PetalsServiceUnitViewComponent } from './petals-service-unit-view.component';

// /workspaces/:workspaceId/petals/service-units/:serviceUnitId
const routes: Routes = [
  {
    path: '',
    component: PetalsServiceUnitViewComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class PetalsServiceUnitViewRoutingModule { }
