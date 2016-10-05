import { NgModule } from '@angular/core';
import { WorkspacesModuleComponent } from './workspaces-module.component';
import {SharedModule} from "../../../shared-module/shared-module.module";
import {WorkspacesRoutingModule} from "./workspaces-module-routing.module";
import {WorkspacesComponent} from "./workspaces/workspaces.component";

@NgModule({
  imports: [
    SharedModule,
    WorkspacesRoutingModule
  ],
  declarations: [WorkspacesModuleComponent, WorkspacesComponent],
  exports: [WorkspacesModuleComponent, WorkspacesComponent]
})
export class WorkspacesModule { }
