import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { PetalsCockpitComponent } from './petals-cockpit/petals-cockpit.component';
import { WorkspacesComponent } from './workspaces/workspaces.component';
import { PetalsMenuToolbarComponent } from './petals/petals-content/petals-content.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'petals-cockpit',
    children: [
      {
        path: '',
        component: PetalsCockpitComponent,
        children: [
          {
            path: '',
            component: PetalsMenuToolbarComponent
          },
          {
            path: 'workspaces',
            component: WorkspacesComponent
          }
        ]
      }
    ]
  },
  {
    path : '**',
    redirectTo: '/login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class PetalsCockpitRoutingModule { }
