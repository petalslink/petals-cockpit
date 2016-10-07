// angular modules
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { Http } from '@angular/http';

// environments for our app
import { environment } from '../environments/environment';

// angular-material2 modules
import { MaterialModule } from '@angular/material';

// angular-translate
import { TranslateStaticLoader, TranslateLoader, TranslateModule } from 'ng2-translate';

// ngrx
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { StoreLogMonitorModule, useLogMonitor } from '@ngrx/store-log-monitor';
// our effects
import { UserEffects } from './shared-module/effects/user.effects';
// our reducers
import { UserReducer } from './shared-module/reducers/user.reducer';
import { WorkspacesReducer } from './shared-module/reducers/workspaces.reducer';
import { ConfigReducer } from './shared-module/reducers/config.reducer';

// our services
import { UserService } from './shared-module/services/user.service';

// our mocks
import { UserMockService } from './shared-module/mocks/user-mock.service';

// our components
import { AppComponent } from './app.component';

// features module
import { FeatureModule } from './features-module/features-module.module';

// shared module
import { SharedModule } from './shared-module/shared-module.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    // angular
    // import browser module only once, then import CommonModule : https://goo.gl/Z05nac
    BrowserModule,
    SharedModule,
    FeatureModule,
    FormsModule,

      // ngrx
    StoreDevtoolsModule.instrumentStore({
      monitor: useLogMonitor({
        visible: false,
        position: 'right'
      })
    }),
    StoreLogMonitorModule,

    // ngrx - store
    StoreModule.provideStore({
      config: ConfigReducer,
      user: UserReducer,
      workspaces: WorkspacesReducer
    }),

    // translate
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: (http: Http) => new TranslateStaticLoader(http, '/assets/i18n', '.json'),
      deps: [Http]
    }),

    // material design
    MaterialModule.forRoot(),
  ],
  providers: [
    UserEffects,
    {
      provide: UserService,
      useClass: (environment.mock ? UserMockService : UserService)
    }
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
