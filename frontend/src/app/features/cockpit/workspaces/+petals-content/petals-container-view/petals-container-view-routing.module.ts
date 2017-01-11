import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PetalsContainerViewComponent } from './petals-container-view.component';

// /workspaces/:idWorkspace/petals/containers/:idContainer
const routes: Routes = [
  {
    path: '',
    component: PetalsContainerViewComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class PetalsContainerViewRoutingModule { }
