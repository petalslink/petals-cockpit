/**
 * Copyright (C) 2017 Linagora
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// import { CockpitModule } from './features/cockpit/cockpit.module';
// import { LoginModule } from './features/login/login.module';
import { environment } from './../environments/environment';
import { GuardLoginService } from './shared/services/guard-login.service';
import { GuardAppService } from './shared/services/guard-app.service';

// export function LoadCockpitModule() {
//   return CockpitModule;
// }

// export function LoadLoginModule() {
//   return LoginModule;
// }

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },
  {
    path: 'login',
    canLoad: [GuardLoginService],
    // loadChildren: LoadLoginModule
    loadChildren: 'app/features/login/login.module#LoginModule'
  },
  {
    path: '',
    canLoad: [GuardAppService],
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
