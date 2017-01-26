import { NgModule } from '@angular/core';

import { SharedModule } from '../../../shared/shared.module';
import { WorkspacesRoutingModule } from './workspaces-routing.module';
import { WorkspacesComponent } from './workspaces.component';
import { WorkspaceComponent } from './workspace/workspace.component';
import { PetalsMenuModule } from './petals-menu/petals-menu.module';
import { environment } from './../../../../environments/environment';
import { BusesInProgressService } from './state/buses-in-progress/buses-in-progress.service';
import { BusesInProgressMockService } from './state/buses-in-progress/buses-in-progress-mock.service';

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
    // TODO : Remove this line when aux route becomes available in lazy loaded module
    // we export here to use this component from cockpit.component
    // were we should instead use a router-outlet
    // (in order to lazy load only what's needed)
    PetalsMenuModule
  ],
  providers: [
    {
      provide: BusesInProgressService,
      useClass: (environment.mock ? BusesInProgressMockService : BusesInProgressService)
    }
  ]
})
export class WorkspacesModule { }
