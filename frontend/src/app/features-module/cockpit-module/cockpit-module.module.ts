// angular modules
import { NgModule } from '@angular/core';

// our modules
import { SharedModule } from '../../shared-module/shared-module.module';
import { CockpitModuleComponent } from './cockpit-module.component';
import { WorkspacesModule } from './workspaces-module/workspaces-module.module';
import { PetalsMenuModule } from './workspaces-module/petals-module/petals-menu-module/petals-menu-module.module';

// our components
import { CockpitComponent } from './cockpit/cockpit.component';
import { ServiceMenuModule } from './workspaces-module/service-module/service-menu-module/service-menu-module.module';
import { ApiMenuModule } from './workspaces-module/api-module/api-menu-module/api-menu-module.module';
import { SettingsComponent } from './settings/settings.component';

@NgModule({
  imports: [
    SharedModule,
    WorkspacesModule,
    PetalsMenuModule,
    ServiceMenuModule,
    ApiMenuModule
  ],
  declarations: [
    CockpitModuleComponent,
    CockpitComponent,
    SettingsComponent
  ],
  exports: [
    CockpitModuleComponent,
    CockpitComponent,
    SettingsComponent
  ]
})
export class CockpitModule { }
