import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PetalsServiceUnitViewComponent } from './petals-service-unit-view.component';

// /workspaces/:idWorkspace/petals/service-units/:idServiceUnit
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
