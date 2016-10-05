import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// angular-material2 modules
import { MaterialModule } from '@angular/material';

// our modules
import { SharedModule } from '../shared-module/shared-module.module';

// our components
import { PetalsComponent } from './petals.component';
import { PetalsSidenavMenuComponent } from '../features-module/cockpit-module/workspaces-module/petals-module/petals-menu-module/petals-sidenav-menu/petals-sidenav-menu.component';
import { BusMenuComponent } from '../features-module/cockpit-module/workspaces-module/petals-module/petals-menu-module/petals-bus-menu/petals-bus-menu.component';
import { BusesMenuComponent } from '../features-module/cockpit-module/workspaces-module/petals-module/petals-menu-module/petals-buses-menu/petals-buses-menu.component';
import { ContainerMenuComponent } from '../features-module/cockpit-module/workspaces-module/petals-module/petals-menu-module/petals-container-menu/petals-container-menu.component';
import { ContainersMenuComponent } from '../features-module/cockpit-module/workspaces-module/petals-module/petals-menu-module/petals-containers-menu/petals-containers-menu.component';
import { ComponentsMenuComponent } from '../features-module/cockpit-module/workspaces-module/petals-module/petals-menu-module/petals-components-menu/petals-components-menu.component';
import { ComponentMenuComponent } from '../features-module/cockpit-module/workspaces-module/petals-module/petals-menu-module/petals-component-menu/petals-component-menu.component';
import { ServiceUnitsMenuComponent } from '../features-module/cockpit-module/workspaces-module/petals-module/petals-menu-module/petals-service-units-menu/petals-service-units-menu.component';
import { ServiceUnitMenuComponent } from '../features-module/cockpit-module/workspaces-module/petals-module/petals-menu-module/petals-service-unit-menu/petals-service-unit-menu.component';
import { PetalsMenuToolbarComponent } from './petals-content/petals-content.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    RouterModule,
    SharedModule
  ],
  exports: [
    PetalsComponent,
    PetalsSidenavMenuComponent
  ],
  declarations: [
    PetalsComponent,
    PetalsSidenavMenuComponent,
    BusMenuComponent,
    BusesMenuComponent,
    ContainerMenuComponent,
    ContainersMenuComponent,
    ComponentsMenuComponent,
    ComponentMenuComponent,
    ServiceUnitsMenuComponent,
    ServiceUnitMenuComponent,
    PetalsMenuToolbarComponent
  ],
  bootstrap: [PetalsComponent]
})
export class PetalsModule { }
