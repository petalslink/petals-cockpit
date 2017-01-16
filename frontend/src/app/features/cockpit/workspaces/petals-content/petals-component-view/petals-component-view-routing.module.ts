import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PetalsComponentViewComponent } from './petals-component-view.component';

// /workspaces/:workspaceId/petals/components/:componentId
const routes: Routes = [
  {
    path: '',
    component: PetalsComponentViewComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class PetalsComponentViewRoutingModule { }
