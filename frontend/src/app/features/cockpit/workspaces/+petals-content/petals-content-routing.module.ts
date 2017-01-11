import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PetalsContentViewComponent } from './petals-content.component';
import { PetalsBusViewModule } from './petals-bus-view/petals-bus-view.module';
import { PetalsContainerViewModule } from './petals-container-view/petals-container-view.module';
import { PetalsComponentViewModule } from './petals-component-view/petals-component-view.module';
import { PetalsServiceUnitViewModule } from './petals-service-unit-view/petals-service-unit-view.module';

export function loadBusViewModule() {
  return PetalsBusViewModule;
}

export function loadContainerViewModule() {
  return PetalsContainerViewModule;
}

export function loadComponentViewModule() {
  return PetalsComponentViewModule;
}

export function loadServiceUnitViewModule() {
  return PetalsServiceUnitViewModule;
}

// /workspaces/:idWorkspace/petals
const routes: Routes = [
  {
    path: '',
    component: PetalsContentViewComponent
  },
  {
    path: 'buses/:idBus',
    loadChildren: loadBusViewModule
  },
  {
    path: 'containers/:idContainer',
    loadChildren: loadContainerViewModule
  },
  {
    path: 'components/:idComponent',
    loadChildren: loadComponentViewModule
  },
  {
    path: 'service-units/:idServiceUnit',
    loadChildren: loadServiceUnitViewModule
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class PetalsContentRoutingModule { }
