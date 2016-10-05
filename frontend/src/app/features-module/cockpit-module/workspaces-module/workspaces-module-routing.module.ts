import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {WorkspacesComponent} from "./workspaces/workspaces.component";
// import { LoginComponent } from './features-module/login-module/login/login.component';
// import { PetalsCockpitComponent } from './features-module/cockpit-module/cockpit/cockpit.component';
// import { PetalsMenuToolbarComponent } from './petals/petals-content/petals-content.component';

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
