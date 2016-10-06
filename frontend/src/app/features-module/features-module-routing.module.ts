// angular modules
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// our modules
import { CockpitRoutingModule } from './cockpit-module/cockpit-module-routing.module';

// our components
import { LoginComponent } from './login-module/login/login.component';

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
