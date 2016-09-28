// angular modules
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, Http } from '@angular/http';

// ng2-translate
import { TranslateModule, TranslateStaticLoader, TranslateLoader } from 'ng2-translate/ng2-translate';

// angular-material2 modules
import { MdCardModule } from '@angular2-material/card';
import { MdButtonToggleModule } from '@angular2-material/button-toggle';
import { MdButtonModule } from '@angular2-material/button';
import { MdSidenavModule } from '@angular2-material/sidenav';
import { MdToolbarModule } from '@angular2-material/toolbar';
import { MdIconModule } from '@angular2-material/icon';
import { MdCheckboxModule } from '@angular2-material/checkbox';
import { MdRadioModule } from '@angular2-material/radio';
import { MdInputModule } from '@angular2-material/input';
import { MdProgressBarModule } from '@angular2-material/progress-bar';
import { MdTabsModule } from '@angular2-material/tabs';

// ngrx - store
import { StoreModule } from '@ngrx/store';
// ngrx - effects
import { EffectsModule } from '@ngrx/effects';

// our reducers
import { CounterReducer } from './reducers/counter.reducer';
import { UserReducer } from './reducers/user.reducer';

// our services
import { UserService } from './services/user.service'

// our components
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { PetalsCockpitComponent } from './petals-cockpit/petals-cockpit.component';

// our routes
import { appRoutes } from './app.routes';

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
    appRoutes,
    // ngrx - store
    StoreModule.provideStore({
      counter: CounterReducer,
      user: UserReducer
    }),
    //ngrx - effects
    EffectsModule,
    // material design
    MdButtonModule,
    MdButtonToggleModule,
    MdSidenavModule,
    MdToolbarModule,
    MdIconModule,
    MdCardModule,
    MdCheckboxModule,
    MdRadioModule,
    MdInputModule,
    MdProgressBarModule,
    MdTabsModule
  ],
  providers: [
    UserService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
