// angular modules
import { NgModule } from '@angular/core';

// our modules
import { SharedModule } from '../../../../../shared-module/shared-module.module';

// our components
import { PetalsMenuModuleComponent } from './petals-menu-module.component';
import { PetalsSidenavMenuComponent } from './petals-sidenav-menu/petals-sidenav-menu.component';
import { BusesMenuComponent } from './petals-buses-menu/petals-buses-menu.component';
import { ContainersMenuComponent } from './petals-containers-menu/petals-containers-menu.component';
import { ComponentsMenuComponent } from './petals-components-menu/petals-components-menu.component';
import { ServiceUnitsMenuComponent } from './petals-service-units-menu/petals-service-units-menu.component';

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [
    PetalsMenuModuleComponent,
    PetalsSidenavMenuComponent,
    BusesMenuComponent,
    ContainersMenuComponent,
    ComponentsMenuComponent,
    ServiceUnitsMenuComponent,
  ],
  exports: [
    PetalsMenuModuleComponent
  ]
})
export class PetalsMenuModule { }
