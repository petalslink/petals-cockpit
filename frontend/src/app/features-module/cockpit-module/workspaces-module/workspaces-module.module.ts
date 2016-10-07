// angular modules
import { NgModule } from '@angular/core';

// our components
import { WorkspacesModuleComponent } from './workspaces-module.component';
import { WorkspacesComponent } from './workspaces/workspaces.component';

// our modules
import { SharedModule } from '../../../shared-module/shared-module.module';
import { WorkspacesRoutingModule } from './workspaces-module-routing.module';
import { PetalsModule } from './petals-module/petals-module.module';
import { ServiceModule } from './service-module/service-module.module';
import { ApiModule } from './api-module/api-module.module';

@NgModule({
  imports: [
    SharedModule,
    PetalsModule,
    ServiceModule,
    ApiModule,
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
