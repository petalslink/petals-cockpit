// angular modules
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// our modules
import { CockpitRoutingModule } from './cockpit-module/cockpit-module-routing.module';

// our components
import { LoginComponent } from './login-module/login/login.component';

export function routeCockpitRoutingModule() {
  return CockpitRoutingModule;
};

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'cockpit',
    loadChildren: routeCockpitRoutingModule
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {enableTracing: false})],
  exports: [RouterModule],
  providers: []
})
export class FeaturesRoutingModule { }
