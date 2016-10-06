// angular modules
import { NgModule } from '@angular/core';

// our modules
import { SharedModule } from '../../../../../shared-module/shared-module.module';

// our components
import { PetalsMenuModuleComponent } from './petals-menu-module.component';
import { PetalsSidenavMenuComponent } from './petals-sidenav-menu/petals-sidenav-menu.component';
import { BusMenuComponent } from './petals-bus-menu/petals-bus-menu.component';
import { BusesMenuComponent } from './petals-buses-menu/petals-buses-menu.component';
import { ContainersMenuComponent } from './petals-containers-menu/petals-containers-menu.component';
import { ContainerMenuComponent } from './petals-container-menu/petals-container-menu.component';
import { ComponentsMenuComponent } from './petals-components-menu/petals-components-menu.component';
import { ServiceUnitsMenuComponent } from './petals-service-units-menu/petals-service-units-menu.component';
import { ServiceUnitMenuComponent } from './petals-service-unit-menu/petals-service-unit-menu.component';
import { ComponentMenuComponent } from './petals-component-menu/petals-component-menu.component';

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [
    PetalsMenuModuleComponent,
    PetalsSidenavMenuComponent,
    BusesMenuComponent,
    BusMenuComponent,
    ContainersMenuComponent,
    ContainerMenuComponent,
    ComponentsMenuComponent,
    ComponentMenuComponent,
    ServiceUnitsMenuComponent,
    ServiceUnitMenuComponent
  ],
  exports: [
    PetalsMenuModuleComponent
  ]
})
export class PetalsMenuModule { }
