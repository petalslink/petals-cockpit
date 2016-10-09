// angular modules
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// our modules
import { WorkspacesRoutingModule } from './workspaces-module/workspaces-module-routing.module';

// our components
import { CockpitComponent } from './cockpit/cockpit.component';

export function routeWorkspacesRoutingModule() {
  return WorkspacesRoutingModule;
};

export const routes: Routes = [
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
        loadChildren: routeWorkspacesRoutingModule
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class CockpitRoutingModule { }
