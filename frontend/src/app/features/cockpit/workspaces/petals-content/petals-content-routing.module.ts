import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PetalsContentViewComponent } from './petals-content.component';
import { PetalsBusViewModule } from './petals-bus-view/petals-bus-view.module';
import { PetalsBusInProgressViewModule } from './petals-bus-in-progress-view/petals-bus-in-progress-view.module';
import { PetalsContainerViewModule } from './petals-container-view/petals-container-view.module';
import { PetalsComponentViewModule } from './petals-component-view/petals-component-view.module';
import { PetalsServiceUnitViewModule } from './petals-service-unit-view/petals-service-unit-view.module';
import { PetalsBusImportViewModule } from './petals-bus-import-view/petals-bus-import-view.module';

export function loadBusViewModule() {
  return PetalsBusViewModule;
}

export function loadBusImportViewModule() {
  return PetalsBusImportViewModule;
}

export function loadBusInProgressViewModule() {
  return PetalsBusInProgressViewModule;
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

// /workspaces/:workspaceId/petals
const routes: Routes = [
  {
    path: '',
    loadChildren: loadBusInProgressViewModule
  },
  {
    path: 'buses/import',
    loadChildren: loadBusImportViewModule
  },
  {
    path: 'buses/:busId',
    loadChildren: loadBusViewModule
  },
  {
    path: 'buses-in-progress/:busInProgressId',
    loadChildren: loadBusInProgressViewModule
  },
  {
    path: 'containers/:containerId',
    loadChildren: loadContainerViewModule
  },
  {
    path: 'components/:componentId',
    loadChildren: loadComponentViewModule
  },
  {
    path: 'service-units/:serviceUnitId',
    loadChildren: loadServiceUnitViewModule
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class PetalsContentRoutingModule { }
