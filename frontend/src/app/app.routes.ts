import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { PetalsCockpitComponent } from './petals-cockpit/petals-cockpit.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'petals-cockpit', component: PetalsCockpitComponent },
  { path : '**', redirectTo: '/login' }
];

export const appRoutes: ModuleWithProviders = RouterModule.forRoot(routes);
