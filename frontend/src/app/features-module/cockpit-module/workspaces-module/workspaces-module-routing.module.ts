// angular modules
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// our components
import { WorkspacesComponent } from './workspaces/workspaces.component';

const routes: Routes = [
  {
    path: '',
    component: WorkspacesComponent
  },
  {
    path: ':idWorkspace',
    pathMatch: 'full',
    component: WorkspacesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class WorkspacesRoutingModule { }
