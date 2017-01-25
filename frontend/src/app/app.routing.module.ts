import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

import { CockpitModule } from './features/cockpit/cockpit.module';
// import { LoginModule } from './features/login/login.module';

export function LoadCockpitModule() {
  return CockpitModule;
}

export const routes: Routes = [
  {
    path: '',
    loadChildren: 'app/features/cockpit/cockpit.module#CockpitModule'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
    // LoginModule,
    // TODO removing CockpitModule breaks the app in AOT with lazy loading ...
    CockpitModule
  ]
})
export class AppRoutingModule { }
