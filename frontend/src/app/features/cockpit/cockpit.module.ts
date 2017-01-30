import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { CockpitRoutingModule } from './cockpit-routing.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { CockpitComponent } from './cockpit.component';
import { EmptyMenuComponent } from './empty-menu/empty-menu.component';
import { WorkspacesDialogComponent } from './workspaces-dialog/workspaces-dialog.component';
import { MenuUserPanelComponent } from './menu-user-panel/menu-user-panel.component';

@NgModule({
  imports: [
    SharedModule,
    CockpitRoutingModule,
    WorkspacesModule
  ],
  declarations: [
    CockpitComponent,
    EmptyMenuComponent,
    WorkspacesDialogComponent,
    MenuUserPanelComponent
  ],
  entryComponents: [WorkspacesDialogComponent]
})
export class CockpitModule { }
