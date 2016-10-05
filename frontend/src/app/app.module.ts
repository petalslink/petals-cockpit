// angular modules
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

// ngrx - store
import { StoreModule } from '@ngrx/store';

// our effects
import { UserEffects } from './shared-module/effects/user.effects';

// our services
import { UserService } from './shared-module/services/user.service';

// our mocks
import { UserMockService } from './shared-module/mocks/user-mock.service';

// core module
// import { CoreModule } from './core-module/core-module.module';

// features module
import { FeatureModule } from './features-module/features-module.module';

// shared module
import { SharedModule } from './shared-module/shared-module.module';

// our components
import { AppComponent } from './app.component';

// our reducers
import { UserReducer } from './shared-module/reducers/user.reducer';
import { WorkspacesReducer } from './shared-module/reducers/workspaces.reducer';
import { ConfigReducer } from './shared-module/reducers/config.reducer';
import {MaterialModule} from "@angular/material";
import {Http} from "@angular/http";
import {TranslateStaticLoader, TranslateLoader, TranslateModule} from "ng2-translate";

import { FeatureComponent } from './features-module/features-module.component';
import {FormsModule} from "@angular/forms";

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
      useClass: UserMockService
    }
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
