// angular modules
import { NgModule } from '@angular/core';

// our modules
import { SharedModule } from '../../shared-module/shared-module.module';
import { CockpitModuleComponent } from './cockpit-module.component';
import { WorkspacesModule } from './workspaces-module/workspaces-module.module';
import { PetalsMenuModule } from './workspaces-module/petals-module/petals-menu-module/petals-menu-module.module';
import { CockpitRoutingModule } from './cockpit-module-routing.module';

// our components
import { CockpitComponent } from './cockpit/cockpit.component';

@NgModule({
  imports: [
    SharedModule,
    CockpitRoutingModule,
    WorkspacesModule,
    PetalsMenuModule
  ],
  declarations: [
    CockpitModuleComponent,
    CockpitComponent
  ],
  exports: [
    CockpitModuleComponent,
    CockpitComponent
  ]
})
export class CockpitModule { }
