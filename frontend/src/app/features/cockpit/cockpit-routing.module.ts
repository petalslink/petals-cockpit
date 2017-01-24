import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CockpitComponent } from './cockpit.component';
import { EmptyMenuComponent } from './empty-menu/empty-menu.component';
// import { WorkspacesModule } from './workspaces/workspaces.module';
// import { PetalsContentModule } from './workspaces/petals-content/petals-content.module';

// export function loadWorkspacesModule() {
//   return WorkspacesModule;
// }

// export function loadPetalsContentModule() {
//   return PetalsContentModule;
// }

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'workspaces'
  },
  {
    path: '',
    component: CockpitComponent,
    children: [
      {
        path: 'workspaces',
        loadChildren: 'app/features/cockpit/workspaces/workspaces.module#WorkspacesModule'
      }
      // {
      //   path: '',
      //   component: EmptyMenuComponent,
      //   outlet: 'aux'
      // }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class CockpitRoutingModule { }
