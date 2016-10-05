import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login-module/login/login.component';
import {CockpitModuleComponent} from "./cockpit-module/cockpit-module.component";
import {CockpitRoutingModule} from "./cockpit-module/cockpit-module-routing.module";
// import { PetalsCockpitComponent } from './cockpit-module/cockpit/cockpit.component';
// import { WorkspacesComponent } from './features-module/cockpit-module/workspaces-module/workspaces/workspaces.component';
// import { PetalsMenuToolbarComponent } from './petals/petals-content/petals-content.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'cockpit',
    loadChildren: () => CockpitRoutingModule
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {enableTracing: false})],
  exports: [RouterModule],
  providers: []
})
export class FeaturesRoutingModule { }
