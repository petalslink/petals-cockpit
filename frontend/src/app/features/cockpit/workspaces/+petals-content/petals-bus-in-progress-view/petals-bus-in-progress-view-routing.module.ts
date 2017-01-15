import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PetalsBusInProgressViewComponent } from './petals-bus-in-progress-view.component';

// /workspaces/:workspaceId/petals/buses-in-progress/:busInProgressId
const routes: Routes = [
  {
    path: '',
    component: PetalsBusInProgressViewComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class PetalsBusInProgressViewRoutingModule { }
