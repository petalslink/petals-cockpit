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

import { NgModule } from '@angular/core';
import { Http } from '@angular/http';
import { StoreModule } from '@ngrx/store';
import { EffectsModule, Actions } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { TranslateModule, TranslateLoader } from 'ng2-translate';
import { SimpleNotificationsModule } from 'angular2-notifications';

import './rxjs-operators';
import { createTranslateLoader } from '../shared/helpers/aot.helper';
import { LANGUAGES } from './opaque-tokens';
import { environment } from '../../environments/environment';
import { getRootReducer } from '../shared/state/root.reducer';
import { WorkspacesEffects } from '../features/cockpit/workspaces/state/workspaces/workspaces.effects';
import { BusesInProgressEffects } from './../features/cockpit/workspaces/state/buses-in-progress/buses-in-progress.effects';
import { UsersEffects } from './../shared/effects/users.effects';
import { UiEffects } from '../shared/effects/ui.effects';
import { BusesEffects } from './../features/cockpit/workspaces/state/buses/buses.effects';
import { ContainersEffects } from './../features/cockpit/workspaces/state/containers/containers.effects';
import { ComponentsEffects } from './../features/cockpit/workspaces/state/components/components.effects';
import { ServiceUnitsEffects } from './../features/cockpit/workspaces/state/service-units/service-units.effects';
import { SseService, SseServiceImpl } from '../shared/services/sse.service';
import { SseServiceMock } from '../shared/services/sse.service.mock';
import {
  WorkspacesService,
  WorkspacesServiceImpl,
} from '../shared/services/workspaces.service';
import { WorkspacesServiceMock } from '../shared/services/workspaces.service.mock';
import { UsersServiceMock } from '../shared/services/users.service.mock';
import {
  UsersService,
  UsersServiceImpl,
} from '../shared/services/users.service';
import { GuardLoginService } from '../shared/services/guard-login.service';
import {
  BusesService,
  BusesServiceImpl,
} from '../shared/services/buses.service';
import { BusesServiceMock } from '../shared/services/buses.service.mock';
import {
  ContainersService,
  ContainersServiceImpl,
} from './../shared/services/containers.service';
import { ContainersServiceMock } from './../shared/services/containers.service.mock';
import {
  ComponentsService,
  ComponentsServiceImpl,
} from './../shared/services/components.service';
import { ComponentsServiceMock } from './../shared/services/components.service.mock';
import {
  ServiceUnitsService,
  ServiceUnitsServiceImpl,
} from './../shared/services/service-units.service';
import { ServiceUnitsServiceMock } from './../shared/services/service-units.service.mock';
import { ActionsWithBatched } from 'app/shared/helpers/batch-actions.helper';
import {
  ServiceAssembliesService,
  ServiceAssembliesServiceImpl,
} from 'app/shared/services/service-assemblies.service';
import { ServiceAssembliesServiceMock } from 'app/shared/services/service-assemblies.service.mock';
import { ServiceAssembliesEffects } from 'app/features/cockpit/workspaces/state/service-assemblies/service-assemblies.effects';
import { SharedLibrariesEffects } from 'app/features/cockpit/workspaces/state/shared-libraries/shared-libraries.effects';
import { SharedLibrariesServiceMock } from 'app/shared/services/shared-libraries.service.mock';
import {
  SharedLibrariesService,
  SharedLibrariesServiceImpl,
} from 'app/shared/services/shared-libraries.service';
import { ResourceByIdResolver } from 'app/shared/services/guard-resource-by-id.resolver';
import { WorkspaceResolver } from 'app/features/cockpit/workspaces/workspace-resolver';

export const providers = [
  {
    provide: LANGUAGES,
    // order matters : The first one will be used by default
    useValue: ['en', 'fr'],
  },
  GuardLoginService,
  WorkspaceResolver,
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
    // TODO : Keep an eye on ngrx V3 to have lazy loaded reducers
    // https://github.com/ngrx/store/pull/269
    StoreModule.provideStore(getRootReducer),
    // Note: the order of declaration is important for batch actions
    // all the sub-actions will be triggered first on WorkspacesEffects,
    // then BusesInProgressEffects, and so on!
    EffectsModule.run(WorkspacesEffects),
    EffectsModule.run(BusesInProgressEffects),
    EffectsModule.run(UsersEffects),
    EffectsModule.run(UiEffects),
    EffectsModule.run(BusesEffects),
    EffectsModule.run(ContainersEffects),
    EffectsModule.run(ComponentsEffects),
    EffectsModule.run(ServiceAssembliesEffects),
    EffectsModule.run(ServiceUnitsEffects),
    EffectsModule.run(SharedLibrariesEffects),
    StoreDevtoolsModule.instrumentOnlyWithExtension(),
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: createTranslateLoader,
      deps: [Http],
    }),
    SimpleNotificationsModule.forRoot(),
  ],
  providers,
})
export class CoreModule {}
