import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { PetalsCockpitComponent } from './petals-cockpit/petals-cockpit.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'petals-cockpit', component: PetalsCockpitComponent },
  { path : '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class PetalsCockpitRoutingModule { }
