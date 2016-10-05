import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import { LoginComponent } from './features-module/login-module/login/login.component';
// import { PetalsCockpitComponent } from './features-module/cockpit-module/cockpit/cockpit.component';
// import { WorkspacesComponent } from './features-module/cockpit-module/workspaces-module/workspaces/workspaces.component';
// import { PetalsMenuToolbarComponent } from './petals/petals-content/petals-content.component';

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class PetalsMenuRoutingModule { }
