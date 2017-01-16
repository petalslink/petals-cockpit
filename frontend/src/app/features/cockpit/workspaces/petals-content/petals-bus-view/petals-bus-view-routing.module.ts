import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PetalsBusViewComponent } from './petals-bus-view.component';

// /workspaces/:workspaceId/petals/buses/:busId
const routes: Routes = [
  {
    path: '',
    component: PetalsBusViewComponent
    // when we'll be able to use router-outlet with material2 tabs
    // https://github.com/angular/material2/issues/524
    // load every tab content separately
    // children: [
    //   {
    //     path: '',
    //     redirectTo: 'overview',
    //   },
    //   {
    //     path: 'overview',
    //     loadChildren:
    //   }
    // ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class PetalsBusViewRoutingModule { }
