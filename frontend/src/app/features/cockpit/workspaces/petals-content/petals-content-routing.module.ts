import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PetalsContentViewComponent } from './petals-content.component';
import { PetalsBusViewModule } from './petals-bus-view/petals-bus-view.module';
import { PetalsBusInProgressViewModule } from './petals-bus-in-progress-view/petals-bus-in-progress-view.module';
import { PetalsContainerViewModule } from './petals-container-view/petals-container-view.module';
import { PetalsComponentViewModule } from './petals-component-view/petals-component-view.module';
import { PetalsServiceUnitViewModule } from './petals-service-unit-view/petals-service-unit-view.module';

export function loadBusInProgressViewModule() {
  return PetalsBusInProgressViewModule;
}

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

// /workspaces/:workspaceId/petals
const routes: Routes = [
  {
    path: '',
    // tslint:disable-next-line:max-line-length
    loadChildren: loadBusInProgressViewModule
    // loadChildren: 'app/features/cockpit/workspaces/petals-content/petals-bus-in-progress-view/petals-bus-in-progress-view.module#PetalsBusInProgressViewModule'
  },
  {
    path: 'buses/:busId',
    // tslint:disable-next-line:max-line-length
    loadChildren: loadBusViewModule
    // loadChildren: 'app/features/cockpit/workspaces/petals-content/petals-bus-view/petals-bus-view.module#PetalsBusViewModule'
  },
  {
    path: 'buses-in-progress',
    // tslint:disable-next-line:max-line-length
    loadChildren: loadBusInProgressViewModule
    // loadChildren: 'app/features/cockpit/workspaces/petals-content/petals-bus-in-progress-view/petals-bus-in-progress-view.module#PetalsBusInProgressViewModule'
  },
  {
    path: 'containers/:containerId',
    // tslint:disable-next-line:max-line-length
    loadChildren: loadContainerViewModule
    // loadChildren: 'app/features/cockpit/workspaces/petals-content/petals-container-view/petals-container-view.module#PetalsContainerViewModule'
  },
  {
    path: 'components/:componentId',
    // tslint:disable-next-line:max-line-length
    loadChildren: loadComponentViewModule
    // loadChildren: 'app/features/cockpit/workspaces/petals-content/petals-component-view/petals-component-view.module#PetalsComponentViewModule'
  },
  {
    path: 'service-units/:serviceUnitId',
    // tslint:disable-next-line:max-line-length
    loadChildren: loadServiceUnitViewModule
    // loadChildren: 'app/features/cockpit/workspaces/petals-content/petals-service-unit-view/petals-service-unit-view.module#PetalsServiceUnitViewModule'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class PetalsContentRoutingModule { }
