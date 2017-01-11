import { NgModule } from '@angular/core';

import { SharedModule } from '../../../shared/shared.module';
import { WorkspacesRoutingModule } from './workspaces-routing.module';
import { WorkspacesComponent } from './workspaces.component';
import { WorkspacesViewComponent } from './workspaces-view/workspaces-view.component';
import { MaterialViewComponent } from './material-tree/material-tree.component';
import { WorkspaceComponent } from './workspace/workspace.component';

@NgModule({
  imports: [
    SharedModule,
    WorkspacesRoutingModule
  ],
  declarations: [
    WorkspacesComponent,
    WorkspacesViewComponent,
    MaterialViewComponent,
    WorkspaceComponent
  ],
  exports: [
    // TODO : Remove this line when lazy loading becomes available
    // we export here to use this component from cockpit.component
    // were we should instead use a router-outlet
    // (in order to lazy load only what's needed)
    MaterialViewComponent
  ]
})
export class WorkspacesModule { }
