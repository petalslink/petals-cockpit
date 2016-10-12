// angular modules
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// our components
import { LoginComponent } from './login-module/login/login.component';
import { CockpitComponent } from './cockpit-module/cockpit/cockpit.component';
import { WorkspacesComponent } from './cockpit-module/workspaces-module/workspaces/workspaces.component';
import { PetalsModuleComponent } from './cockpit-module/workspaces-module/petals-module/petals-module.component';
import { ServiceModuleComponent } from './cockpit-module/workspaces-module/service-module/service-module.component';
import { ApiModuleComponent } from './cockpit-module/workspaces-module/api-module/api-module.component';
/* tslint:disable:max-line-length */
import {PetalsBusContentComponent} from './cockpit-module/workspaces-module/petals-module/petals-content-module/petals-bus-content/petals-bus-content.component';
import {PetalsContainerContentComponent} from './cockpit-module/workspaces-module/petals-module/petals-content-module/petals-container-content/petals-container-content.component';
import {PetalsComponentContentComponent} from './cockpit-module/workspaces-module/petals-module/petals-content-module/petals-component-content/petals-component-content.component';
import {PetalsServiceUnitContentComponent} from './cockpit-module/workspaces-module/petals-module/petals-content-module/petals-service-unit-content/petals-service-unit-content.component';
/* tslint:enable:max-line-length */

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/cockpit/workspaces'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'cockpit',
    children: [
      {
        path: '',
        component: CockpitComponent,
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'workspaces'
          },
          {
            path: 'workspaces',
            children: [
              {
                path: '',
                component: WorkspacesComponent
              },
              {
                path: ':idWorkspace',
                component: WorkspacesComponent,
                pathMatch: 'full',
              },
              {
                path: ':idWorkspace/petals',
                component: PetalsModuleComponent
              },
              {
                path: ':idWorkspace/petals/bus/:idBus',
                component: PetalsBusContentComponent
              },
              {
                path: ':idWorkspace/petals/bus/:idBus/container/:idContainer',
                component: PetalsContainerContentComponent
              },
              {
                path: ':idWorkspace/petals/bus/:idBus/container/:idContainer/component/:idComponent',
                component: PetalsComponentContentComponent
              },
              {
                path: `:idWorkspace/petals/bus/:idBus/container/:idContainer/component/:idComponent/serviceUnit/:idServiceUnit`,
                component: PetalsServiceUnitContentComponent
              },
              {
                path: ':idWorkspace/service',
                component: ServiceModuleComponent
              },
              {
                path: ':idWorkspace/api',
                component: ApiModuleComponent
              }
            ]
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {enableTracing: false})],
  exports: [RouterModule],
  providers: []
})
export class FeaturesRoutingModule { }
