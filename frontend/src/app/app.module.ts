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
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

// our reducers
import { ConfigReducer } from './shared-module/reducers/config.reducer';
import { UserReducer } from './shared-module/reducers/user.reducer';
import { MinimalWorkspacesReducer } from './shared-module/reducers/minimal-workspaces.reducer';
import { WorkspaceReducer } from './shared-module/reducers/workspace.reducer';

// our effects
import { UserEffects } from './shared-module/effects/user.effects';
import { WorkspaceEffects } from './shared-module/effects/workspace.effects';
import { MinimalWorkspacesEffects } from './shared-module/effects/minimal-workspaces.effects';

// our services
import { UserService } from './shared-module/services/user.service';
import { HttpResponseInterceptor } from './shared-module/services/http-response-interceptor.service';
import { WorkspaceService } from './shared-module/services/workspace.service';
import { WorkspaceMockService } from './shared-module/mocks/workspace-mock.service';
import { SseService } from './shared-module/services/sse.service';
import { SseMockService } from './shared-module/mocks/sse-mock.service';
import { RouteService } from './shared-module/services/route.service';

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

    // ngrx - store
    StoreModule.provideStore({
      config: ConfigReducer,
      user: UserReducer,
      minimalWorkspaces: MinimalWorkspacesReducer,
      workspace: WorkspaceReducer
    }),

    // ngrx
    StoreDevtoolsModule.instrumentOnlyWithExtension(),

    // effects
    EffectsModule.runAfterBootstrap(UserEffects),
    EffectsModule.runAfterBootstrap(MinimalWorkspacesEffects),
    EffectsModule.runAfterBootstrap(WorkspaceEffects),

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

    // guards
    AuthGuardService,
    AlreadyLoggedGuardService,

    // services
    RouteService,
    {
      provide: SseService,
      useClass: (environment.mock ? SseMockService : SseService)
    },
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
