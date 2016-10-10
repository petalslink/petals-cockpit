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
import { ServiceMenuModule } from './workspaces-module/service-module/service-menu-module/service-menu-module.module';
import { ApiMenuModule } from './workspaces-module/api-module/api-menu-module/api-menu-module.module';

@NgModule({
  imports: [
    SharedModule,
    CockpitRoutingModule,
    WorkspacesModule,
    PetalsMenuModule,
    ServiceMenuModule,
    ApiMenuModule
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
