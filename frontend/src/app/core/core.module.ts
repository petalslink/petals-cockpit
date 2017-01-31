import { NgModule, ModuleWithProviders } from '@angular/core';
import { Http } from '@angular/http';
import { MaterialModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { TranslateModule, TranslateLoader, TranslateStaticLoader } from 'ng2-translate';

import './rxjs-operators';
import { createTranslateLoader } from '../shared/helpers/aot.helper';
import { LANGUAGES } from './opaque-tokens';
import { environment } from '../../environments/environment';
import { getRootReducer } from '../shared/state/root.reducer';
import { WorkspacesEffects } from '../features/cockpit/workspaces/state/workspaces/workspaces.effects';
import { BusesInProgressEffects } from './../features/cockpit/workspaces/state/buses-in-progress/buses-in-progress.effects';
import { UsersEffects } from './../shared/effects/users.effects';
import { SseService } from '../shared/services/sse.service';
import { SseServiceMock } from '../shared/services/sse.service.mock';
import { BusesInProgressService } from '../shared/services/buses-in-progress.service';
import { BusesInProgressMockService } from '../shared/services/buses-in-progress-mock.service';
import { WorkspacesService } from '../shared/services/workspaces.service';
import { WorkspacesMockService } from '../shared/services/workspaces.mock';
import { UsersMockService } from '../shared/services/users.mock';
import { UsersService } from '../shared/services/users.service';
import { GuardLoginService } from '../shared/services/guard-login.service';
import { GuardAppService } from '../shared/services/guard-app.service';
import { BusesService } from '../shared/services/buses.service';
import { BusesMockService } from '../shared/services/buses.service.mock';

export const providers = [
  {
    provide: LANGUAGES,
    // order matters : The first one will be used by default
    useValue: ['en', 'fr']
  },
  GuardLoginService,
  GuardAppService,
  {
    provide: SseService,
    useClass: (environment.mock ? SseServiceMock : SseService)
  },
  {
    provide: BusesInProgressService,
    useClass: (environment.mock ? BusesInProgressMockService : BusesInProgressService)
  },
  {
    provide: BusesService,
    useClass: (environment.mock ? BusesMockService : BusesService)
  },
  {
    provide: WorkspacesService,
    useClass: (environment.mock ? WorkspacesMockService : WorkspacesService)
  },
  {
    provide: UsersService,
    useClass: (environment.mock ? UsersMockService : UsersService)
  }
];

@NgModule({
  imports: [
    FlexLayoutModule.forRoot(),
    // TODO : Keep an eye on ngrx V3 to have lazy loaded reducers
    // https://github.com/ngrx/store/pull/269
    StoreModule.provideStore(getRootReducer),
    EffectsModule.run(WorkspacesEffects),
    EffectsModule.run(BusesInProgressEffects),
    EffectsModule.run(UsersEffects),
    StoreDevtoolsModule.instrumentOnlyWithExtension(),
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: (createTranslateLoader),
      deps: [Http]
    })
  ],
  providers
})
export class CoreModule { }
