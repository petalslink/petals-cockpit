// angular modules
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, Http } from '@angular/http';

// ng2-translate
import { TranslateModule, TranslateStaticLoader, TranslateLoader } from 'ng2-translate/ng2-translate';

// angular-material2 modules
import { MaterialModule } from '@angular/material';

// ngrx - store
import { StoreModule } from '@ngrx/store';
// ngrx - effects
import { EffectsModule } from '@ngrx/effects';

// our reducers
import { CounterReducer } from './reducers/counter.reducer';
import { UserReducer } from './reducers/user.reducer';
import { WorkspacesReducer } from './reducers/workspaces.reducer';

// our effects
import { UserEffects } from './effects/user.effects';

// our services
import { UserService } from './services/user.service';

// our mocks
import { UserMockService } from './mocks/user-mock.service';

// our modules
import { PetalsModule } from './petals/petals.module';
import { ServiceModule } from './service/service.module';
import { ApiModule } from './api/api.module';

// our components
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { PetalsCockpitComponent } from './petals-cockpit/petals-cockpit.component';

// our routes
import { PetalsCockpitRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    PetalsCockpitComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    // translate
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: (http: Http) => new TranslateStaticLoader(http, '/assets/i18n', '.json'),
      deps: [Http]
    }),
    // routes
    PetalsCockpitRoutingModule,
    // ngrx - store
    StoreModule.provideStore({
      counter: CounterReducer,
      user: UserReducer,
      workspaces: WorkspacesReducer
    }),
    // ngrx - effects
    EffectsModule,
    // material design
    MaterialModule.forRoot(),
    // our modules
    PetalsModule,
    ServiceModule,
    ApiModule
  ],
  providers: [
    UserEffects,
    { provide: UserService, useClass: UserMockService }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
