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
import { WorkspacesMockService } from '../features/cockpit/workspaces/state/workspaces/workspaces.mock';
import { WorkspacesService } from '../features/cockpit/workspaces/state/workspaces/workspaces.service';

@NgModule({
  imports: [
    MaterialModule.forRoot(),
    FlexLayoutModule.forRoot(),
    // TODO : Keep an eye on ngrx V3 to have lazy loaded reducers
    // https://github.com/ngrx/store/pull/269
    StoreModule.provideStore(getRootReducer),
    EffectsModule.run(WorkspacesEffects),
    EffectsModule.run(BusesInProgressEffects),
    StoreDevtoolsModule.instrumentOnlyWithExtension(),
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: (createTranslateLoader),
      deps: [Http]
    })
  ],
  providers: [
    {
      provide: LANGUAGES,
      // order matters : The first one will be use by default
      useValue: ['en', 'fr']
    },
    {
      provide: WorkspacesService,
      useClass: (environment.mock ? WorkspacesMockService : WorkspacesService)
    }
  ]
})
export class CoreModule { }
