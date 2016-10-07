// angular modules
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// our components
import { WorkspacesComponent } from './workspaces/workspaces.component';
import { PetalsModuleComponent } from './petals-module/petals-module.component';
import { ServiceModuleComponent } from './service-module/service-module.component';
import { ApiModuleComponent } from './api-module/api-module.component';

const routes: Routes = [
  {
    path: '',
    component: WorkspacesComponent
  },
  {
    path: ':idWorkspace',
    component: WorkspacesComponent,
    pathMatch: 'full',
  },
  {
    path: ':idWorkspace/petals',
    component: PetalsModuleComponent
  },
  {
    path: ':idWorkspace/service',
    component: ServiceModuleComponent
  },
  {
    path: ':idWorkspace/api',
    component: ApiModuleComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class WorkspacesRoutingModule { }
