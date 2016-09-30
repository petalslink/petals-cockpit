import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// angular-material2 modules
import { MaterialModule } from '@angular/material';

// our components
import { PetalsComponent } from './petals.component';
import { PetalsSidenavMenuComponent } from './petals-sidenav-menu/petals-sidenav-menu.component';
import { BusMenuComponent } from './bus-menu/bus-menu.component';
import { BusesMenuComponent } from './buses-menu/buses-menu.component';

@NgModule({
  imports: [
    CommonModule,
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
    BusesMenuComponent
  ],
  bootstrap: [PetalsComponent]
})
export class PetalsModule { }
