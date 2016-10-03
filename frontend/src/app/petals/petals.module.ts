import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// angular-material2 modules
import { MaterialModule } from '@angular/material';

// our components
import { PetalsComponent } from './petals.component';
import { PetalsSidenavMenuComponent } from './petals-sidenav-menu/petals-sidenav-menu.component';
import { BusMenuComponent } from './bus-menu/bus-menu.component';
import { BusesMenuComponent } from './buses-menu/buses-menu.component';
import { ContainerMenuComponent } from './container-menu/container-menu.component';
import { ContainersMenuComponent } from './containers-menu/containers-menu.component';
import { ComponentsMenuComponent } from './components-menu/components-menu.component';
import { ComponentMenuComponent } from './component-menu/component-menu.component';
import { ServiceUnitsMenuComponent } from './service-units-menu/service-units-menu.component';
import { ServiceUnitMenuComponent } from './service-unit-menu/service-unit-menu.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule
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
    ServiceUnitMenuComponent
  ],
  bootstrap: [PetalsComponent]
})
export class PetalsModule { }
