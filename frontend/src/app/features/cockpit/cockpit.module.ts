import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { CockpitRoutingModule } from './cockpit-routing.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { CockpitComponent } from './cockpit.component';
import { EmptyMenuComponent } from './empty-menu/empty-menu.component';
import { WorkspacesDialogComponent } from './workspaces-dialog/workspaces-dialog.component';

@NgModule({
  imports: [
    SharedModule,
    CockpitRoutingModule,
    WorkspacesModule
  ],
  declarations: [
    CockpitComponent,
    EmptyMenuComponent,
    WorkspacesDialogComponent
  ],
  entryComponents: [WorkspacesDialogComponent]
})
export class CockpitModule { }
