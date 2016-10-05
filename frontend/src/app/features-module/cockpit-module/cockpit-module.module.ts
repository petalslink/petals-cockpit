import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CockpitModuleComponent } from './cockpit-module.component';
import {SharedModule} from "../../shared-module/shared-module.module";
import {CockpitComponent} from "./cockpit/cockpit.component";
import {CockpitRoutingModule} from "./cockpit-module-routing.module";
import {WorkspacesModule} from "./workspaces-module/workspaces-module.module";
import {PetalsMenuModule} from "./workspaces-module/petals-module/petals-menu-module/petals-menu-module.module";

@NgModule({
  imports: [
    SharedModule,
    CockpitRoutingModule,
    WorkspacesModule,
    PetalsMenuModule
  ],
  declarations: [CockpitModuleComponent, CockpitComponent],
  exports: [CockpitModuleComponent, CockpitComponent]
})
export class CockpitModule { }
