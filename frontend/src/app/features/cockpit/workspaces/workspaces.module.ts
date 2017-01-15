import { NgModule } from '@angular/core';

import { SharedModule } from '../../../shared/shared.module';
import { WorkspacesRoutingModule } from './workspaces-routing.module';
import { WorkspacesComponent } from './workspaces.component';
import { WorkspaceComponent } from './workspace/workspace.component';
import { PetalsMenuModule } from './+petals-menu/petals-menu.module';

@NgModule({
  imports: [
    SharedModule,
    WorkspacesRoutingModule,
    PetalsMenuModule
  ],
  declarations: [
    WorkspacesComponent,
    WorkspaceComponent
  ],
  exports: [
    // TODO : Remove this line when lazy loading becomes available
    // we export here to use this component from cockpit.component
    // were we should instead use a router-outlet
    // (in order to lazy load only what's needed)
    PetalsMenuModule
  ]
})
export class WorkspacesModule { }
