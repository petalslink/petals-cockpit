// angular modules
import { NgModule } from '@angular/core';

// our components
import { WorkspacesModuleComponent } from './workspaces-module.component';
import { WorkspacesComponent } from './workspaces/workspaces.component';

// our modules
import { SharedModule } from '../../../shared-module/shared-module.module';
import { WorkspacesRoutingModule } from './workspaces-module-routing.module';

@NgModule({
  imports: [
    SharedModule,
    WorkspacesRoutingModule
  ],
  declarations: [
    WorkspacesModuleComponent,
    WorkspacesComponent
  ],
  exports: [
    WorkspacesModuleComponent,
    WorkspacesComponent
  ]
})
export class WorkspacesModule { }
