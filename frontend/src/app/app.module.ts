// angular modules
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { Http } from '@angular/http';

// http interceptor
import { provideInterceptorService } from 'ng2-interceptors';

// our environment
import { environment } from '../environments/environment';

// angular-material2 modules
import { MaterialModule } from '@angular/material';

// angular-translate
import { TranslateStaticLoader, TranslateLoader, TranslateModule } from 'ng2-translate';

// ngrx
import { StoreModule } from '@ngrx/store';
// import { StoreDevtoolsModule } from '@ngrx/store-devtools';
// import { StoreLogMonitorModule, useLogMonitor } from '@ngrx/store-log-monitor';

// our effects
import { UserEffects } from './shared-module/effects/user.effects';
import { WorkspaceEffects } from './shared-module/effects/workspace.effects';
// our reducers
import { UserReducer } from './shared-module/reducers/user.reducer';
import { WorkspacesReducer } from './shared-module/reducers/workspaces.reducer';
import { ConfigReducer } from './shared-module/reducers/config.reducer';

// our services
import { UserService } from './shared-module/services/user.service';
import { HttpResponseInterceptor } from './shared-module/services/http-response-interceptor.service';
import { WorkspaceService } from './shared-module/services/workspace.service';
import { WorkspaceMockService } from './shared-module/mocks/workspace-mock.service';

// our guards
import { AuthGuardService } from './shared-module/services/auth-guard.service';
import { AlreadyLoggedGuardService } from './shared-module/services/already-logged-guard.service';

// our mocks
import { UserMockService } from './shared-module/mocks/user-mock.service';

// our components
import { AppComponent } from './app.component';

// features module
import { FeatureModule } from './features-module/features-module.module';

// shared module
import { SharedModule } from './shared-module/shared-module.module';

export function createTranslateLoader(http: Http) {
  return new TranslateStaticLoader(http, './assets/i18n', '.json');
}

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
    // StoreDevtoolsModule.instrumentStore({
    //   monitor: useLogMonitor({
    //     visible: false,
    //     position: 'right'
    //   })
    // }),
    // StoreLogMonitorModule,

    // ngrx - store
    StoreModule.provideStore({
      config: ConfigReducer,
      user: UserReducer,
      workspaces: WorkspacesReducer
    }),

    // translate
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: createTranslateLoader,
      deps: [Http]
    }),

    // material design
    MaterialModule.forRoot(),
  ],
  providers: [
    // http interceptors
    HttpResponseInterceptor,
    provideInterceptorService([
      HttpResponseInterceptor
    ]),

    // effects
    UserEffects,
    WorkspaceEffects,

    // guards
    AuthGuardService,
    AlreadyLoggedGuardService,

    // services
    {
      provide: UserService,
      useClass: (environment.mock ? UserMockService : UserService)
    },
    {
      provide: WorkspaceService,
      useClass: (environment.mock ? WorkspaceMockService : WorkspaceService)
    }
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
