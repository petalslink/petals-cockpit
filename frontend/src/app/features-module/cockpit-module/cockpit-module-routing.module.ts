import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {WorkspacesComponent} from "./workspaces-module/workspaces/workspaces.component";
import {WorkspacesModuleComponent} from "./workspaces-module/workspaces-module.component";
import {CockpitComponent} from "./cockpit/cockpit.component";
import {WorkspacesRoutingModule} from "./workspaces-module/workspaces-module-routing.module";
// import { LoginComponent } from './features-module/login-module/login/login.component';
// import { PetalsCockpitComponent } from './features-module/cockpit-module/cockpit/cockpit.component';
// import { WorkspacesComponent } from './features-module/cockpit-module/workspaces-module/workspaces/workspaces.component';
// import { PetalsMenuToolbarComponent } from './petals/petals-content/petals-content.component';

const routes: Routes = [
  {
    path: '',
    component: CockpitComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'workspaces'
      },
      {
        path: 'workspaces',
        loadChildren: () => WorkspacesRoutingModule
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class CockpitRoutingModule { }
