import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkspacesComponent } from './workspaces.component';
import { PetalsContentModule } from './petals-content/petals-content.module';
import { WorkspaceComponent } from './workspace/workspace.component';

export function loadPetalsContentModule() {
  return PetalsContentModule;
}

// /workspaces
const routes: Routes = [
  {
    path: '',
    component: WorkspacesComponent
  },
  {
    path: ':workspaceId',
    component: WorkspaceComponent
  },
  {
    path: ':workspaceId/petals',
    // loadChildren: loadPetalsContentModule
    loadChildren: 'app/features/cockpit/workspaces/petals-content/petals-content.module#PetalsContentModule'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  providers: []
})
export class WorkspacesRoutingModule { }
