/**
 * Copyright (C) 2017 Linagora
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { ModuleWithProviders, NgModule } from '@angular/core';
import { Actions, EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { SimpleNotificationsModule } from 'angular2-notifications';

import { BusesInProgressEffects } from 'app/features/cockpit/workspaces/state/buses-in-progress/buses-in-progress.effects';
import { BusesEffects } from 'app/features/cockpit/workspaces/state/buses/buses.effects';
import { ComponentsEffects } from 'app/features/cockpit/workspaces/state/components/components.effects';
import { ContainersEffects } from 'app/features/cockpit/workspaces/state/containers/containers.effects';
import { ServiceAssembliesEffects } from 'app/features/cockpit/workspaces/state/service-assemblies/service-assemblies.effects';
import { ServiceUnitsEffects } from 'app/features/cockpit/workspaces/state/service-units/service-units.effects';
import { SharedLibrariesEffects } from 'app/features/cockpit/workspaces/state/shared-libraries/shared-libraries.effects';
import { WorkspacesEffects } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.effects';
import { ActionsWithBatched } from 'app/shared/helpers/batch-actions.helper';
import {
  BusesService,
  BusesServiceImpl,
} from 'app/shared/services/buses.service';
import { BusesServiceMock } from 'app/shared/services/buses.service.mock';
import {
  ComponentsService,
  ComponentsServiceImpl,
} from 'app/shared/services/components.service';
import { ComponentsServiceMock } from 'app/shared/services/components.service.mock';
import {
  ContainersService,
  ContainersServiceImpl,
} from 'app/shared/services/containers.service';
import { ContainersServiceMock } from 'app/shared/services/containers.service.mock';
import { GuardLoginService } from 'app/shared/services/guard-login.service';
import { ResourceByIdResolver } from 'app/shared/services/guard-resource-by-id.resolver';
import {
  ServiceAssembliesService,
  ServiceAssembliesServiceImpl,
} from 'app/shared/services/service-assemblies.service';
import { ServiceAssembliesServiceMock } from 'app/shared/services/service-assemblies.service.mock';
import {
  ServiceUnitsService,
  ServiceUnitsServiceImpl,
} from 'app/shared/services/service-units.service';
import { ServiceUnitsServiceMock } from 'app/shared/services/service-units.service.mock';
import {
  SharedLibrariesService,
  SharedLibrariesServiceImpl,
} from 'app/shared/services/shared-libraries.service';
import { SharedLibrariesServiceMock } from 'app/shared/services/shared-libraries.service.mock';
import { SseService, SseServiceImpl } from 'app/shared/services/sse.service';
import { SseServiceMock } from 'app/shared/services/sse.service.mock';
import {
  UsersService,
  UsersServiceImpl,
} from 'app/shared/services/users.service';
import { UsersServiceMock } from 'app/shared/services/users.service.mock';
import {
  WorkspacesService,
  WorkspacesServiceImpl,
} from 'app/shared/services/workspaces.service';
import { WorkspacesServiceMock } from 'app/shared/services/workspaces.service.mock';
import { metaReducers, reducers } from 'app/shared/state/root.reducer';
import { UiEffects } from 'app/shared/state/ui.effects';
import { UsersEffects } from 'app/shared/state/users.effects';
import { environment } from 'environments/environment';
import './rxjs-operators';

export const providers = [
  GuardLoginService,
  ResourceByIdResolver,
  {
    provide: SseService,
    useClass: environment.mock ? SseServiceMock : SseServiceImpl,
  },
  {
    provide: BusesService,
    useClass: environment.mock ? BusesServiceMock : BusesServiceImpl,
  },
  {
    provide: ContainersService,
    useClass: environment.mock ? ContainersServiceMock : ContainersServiceImpl,
  },
  {
    provide: ComponentsService,
    useClass: environment.mock ? ComponentsServiceMock : ComponentsServiceImpl,
  },
  {
    provide: ServiceAssembliesService,
    useClass: environment.mock
      ? ServiceAssembliesServiceMock
      : ServiceAssembliesServiceImpl,
  },
  {
    provide: ServiceUnitsService,
    useClass: environment.mock
      ? ServiceUnitsServiceMock
      : ServiceUnitsServiceImpl,
  },
  {
    provide: SharedLibrariesService,
    useClass: environment.mock
      ? SharedLibrariesServiceMock
      : SharedLibrariesServiceImpl,
  },
  {
    provide: WorkspacesService,
    useClass: environment.mock ? WorkspacesServiceMock : WorkspacesServiceImpl,
  },
  {
    provide: UsersService,
    useClass: environment.mock ? UsersServiceMock : UsersServiceImpl,
  },
  // we override the default one with ours aware of batch actions
  {
    provide: Actions,
    useClass: ActionsWithBatched,
  },
];

@NgModule({
  imports: [
    StoreModule.forRoot(reducers, { metaReducers }),
    // Note: the order of declaration is important for batch actions
    // all the sub-actions will be triggered first on WorkspacesEffects,
    // then BusesInProgressEffects, and so on!
    EffectsModule.forRoot([
      WorkspacesEffects,
      BusesInProgressEffects,
      UsersEffects,
      UiEffects,
      BusesEffects,
      ContainersEffects,
      ComponentsEffects,
      ServiceAssembliesEffects,
      ServiceUnitsEffects,
      SharedLibrariesEffects,
    ]),
    // it's not clear if the module is enabled when the extension is not present...
    // !environment.production ? StoreDevtoolsModule.instrument({ maxAge: 50 }) : [],
    StoreDevtoolsModule.instrument({ maxAge: 50 }),
    SimpleNotificationsModule.forRoot(),
  ],
})
export class CoreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CoreModule,
      providers,
    };
  }
}
