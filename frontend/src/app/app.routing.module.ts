import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CockpitModule } from './features/cockpit/cockpit.module';
import { LoginModule } from './features/login/login.module';

export function LoadCockpitModule() {
  return CockpitModule;
}

export const routes: Routes = [
  {
    path: '',
    // loadChildren: 'app/features/cockpit/cockpit.module#CockpitModule'
    loadChildren: LoadCockpitModule
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    LoginModule,
    CockpitModule
  ]
})
export class AppRoutingModule { }
