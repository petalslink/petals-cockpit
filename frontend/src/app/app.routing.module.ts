import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

import { CockpitModule } from './features/cockpit/cockpit.module';
import { LoginModule } from './features/login/login.module';
import { environment } from './../environments/environment';

export function LoadCockpitModule() {
  return CockpitModule;
}

export function LoadLoginModule() {
  return LoginModule;
}

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },
  {
    path: 'login',
    // loadChildren: LoadLoginModule
    loadChildren: 'app/features/login/login.module#LoginModule'
  },
  {
    path: '',
    // loadChildren: LoadCockpitModule
    loadChildren: 'app/features/cockpit/cockpit.module#CockpitModule'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      // preloadingStrategy: PreloadAllModules,
      useHash: (environment.hashLocationStrategy ? true : false),
      enableTracing: false
    }),
    // LoginModule,
    // TODO removing CockpitModule breaks the app in AOT with lazy loading ...
    // CockpitModule
  ]
})
export class AppRoutingModule { }
