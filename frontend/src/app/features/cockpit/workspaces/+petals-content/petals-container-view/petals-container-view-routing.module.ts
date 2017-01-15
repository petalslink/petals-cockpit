import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PetalsContainerViewComponent } from './petals-container-view.component';

// /workspaces/:workspaceId/petals/containers/:containerId
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
