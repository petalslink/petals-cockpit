/**
 * Copyright (C) 2017-2018 Linagora
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

import { ModuleWithProviders, NgModule, Provider } from '@angular/core';
import { Actions, EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { LocalStorageService, Ng2Webstorage } from 'ngx-webstorage';

import { BusesInProgressEffects } from 'app/features/cockpit/workspaces/state/buses-in-progress/buses-in-progress.effects';
import { BusesEffects } from 'app/features/cockpit/workspaces/state/buses/buses.effects';
import { ComponentsEffects } from 'app/features/cockpit/workspaces/state/components/components.effects';
import { ContainersEffects } from 'app/features/cockpit/workspaces/state/containers/containers.effects';
import { EndpointsEffects } from 'app/features/cockpit/workspaces/state/endpoints/endpoints.effects';
import { InterfacesEffects } from 'app/features/cockpit/workspaces/state/interfaces/interfaces.effects';
import { ServiceAssembliesEffects } from 'app/features/cockpit/workspaces/state/service-assemblies/service-assemblies.effects';
import { ServiceUnitsEffects } from 'app/features/cockpit/workspaces/state/service-units/service-units.effects';
import { ServicesEffects } from 'app/features/cockpit/workspaces/state/services/services.effects';
import { SharedLibrariesEffects } from 'app/features/cockpit/workspaces/state/shared-libraries/shared-libraries.effects';
import { WorkspacesEffects } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.effects';
import { ActionsWithBatched } from 'app/shared/helpers/batch-actions.helper';
import { GuardLoginService } from 'app/shared/services/guard-login.service';
import { metaReducers, reducers } from 'app/shared/state/root.reducer';
import { UiEffects } from 'app/shared/state/ui.effects';
import { UsersEffects } from 'app/shared/state/users.effects';
import { environment } from 'environments/environment';

export const providers: Provider[] = [
  ...environment.services,
  GuardLoginService,
  // we override the default one with ours aware of batch actions
  {
    provide: Actions,
    useClass: ActionsWithBatched,
  },
  LocalStorageService,
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
      ServicesEffects,
      InterfacesEffects,
      EndpointsEffects,
      SharedLibrariesEffects,
    ]),
    // it's not clear if the module is enabled when the extension is not present...
    // !environment.production ? StoreDevtoolsModule.instrument({ maxAge: 50 }) : [],
    StoreDevtoolsModule.instrument({ maxAge: 50 }),
    SimpleNotificationsModule.forRoot(),
    Ng2Webstorage.forRoot({ prefix: 'petals-cockpit', separator: '-' }),
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
