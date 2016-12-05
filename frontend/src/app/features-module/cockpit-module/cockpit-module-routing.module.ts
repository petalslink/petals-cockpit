/**
 * Copyright (C) 2016 Linagora
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

// angular modules
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// our components

/* tslint:disable:max-line-length */
import { NotFoundComponent } from './../../shared-module/components/not-found/not-found.component';
import { CockpitComponent } from './cockpit/cockpit.component';
import { PetalsBusImportComponent } from './workspaces-module/petals-module/petals-content-module/petals-bus-content/petals-bus-import/petals-bus-import.component';
import { ApiModuleComponent } from './workspaces-module/api-module/api-module.component';
import { PetalsServiceUnitContentComponent } from './workspaces-module/petals-module/petals-content-module/petals-service-unit-content/petals-service-unit-content.component';
import { ServiceModuleComponent } from './workspaces-module/service-module/service-module.component';
import { PetalsComponentContentComponent } from './workspaces-module/petals-module/petals-content-module/petals-component-content/petals-component-content.component';
import { PetalsContainerContentComponent } from './workspaces-module/petals-module/petals-content-module/petals-container-content/petals-container-content.component';
import { PetalsBusContentComponent } from './workspaces-module/petals-module/petals-content-module/petals-bus-content/petals-bus-content.component';
import { PetalsModuleComponent } from './workspaces-module/petals-module/petals-module.component';
import { SettingsComponent } from './settings/settings.component';
import { WorkspacesComponent } from './workspaces-module/workspaces/workspaces.component';
/* tslint:enable:max-line-length */

const routes: Routes = [
  {
    path: '',
    component: CockpitComponent,
    children: [
      {
        path: '404',
        component: NotFoundComponent,
      },
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
            path: 'settings',
            component: SettingsComponent
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
            path: ':idWorkspace/petals/bus/import',
            component: PetalsBusImportComponent
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
            path: ':idWorkspace/petals/bus/:idBus/container/:idContainer/component/:idComponent/serviceUnit/:idServiceUnit',
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
      },
      {
        path: '**',
        redirectTo: '404'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  providers: []
})
export class CockpitRoutingModule { }
