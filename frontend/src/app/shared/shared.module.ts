import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from '@angular/material';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { TranslateModule } from 'ng2-translate';
import { PrettyJsonModule } from 'angular2-prettyjson';
import { SimpleNotificationsModule } from 'angular2-notifications';

import { GenerateIconComponent } from './components/generate-icon/generate-icon.component';
import { SseService } from './services/sse.service';
import { SseServiceMock } from './services/sse.service.mock';
import { environment } from './../../environments/environment';
import { BusesInProgressService } from './services/buses-in-progress.service';
import { BusesInProgressMockService } from './services/buses-in-progress-mock.service';
import { WorkspacesService } from './services/workspaces.service';
import { WorkspacesMockService } from './services/workspaces.mock';
import { UsersMockService } from './services/users.mock';
import { UsersService } from './services/users.service';
import { GuardLoginService } from './services/guard-login.service';
import { GuardAppService } from './services/guard-app.service';

export const modules = [
  CommonModule,
  ReactiveFormsModule,
  HttpModule,
  RouterModule,
  MaterialModule,
  FlexLayoutModule,
  StoreModule,
  StoreDevtoolsModule,
  TranslateModule,
  PrettyJsonModule,
  SimpleNotificationsModule
];

export const declarations = [GenerateIconComponent];

export const providers = [
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
    provide: WorkspacesService,
    useClass: (environment.mock ? WorkspacesMockService : WorkspacesService)
  },
  {
    provide: UsersService,
    useClass: (environment.mock ? UsersMockService : UsersService)
  }
];

@NgModule({
  imports: modules,
  exports: [...modules, ...declarations],
  declarations,
  providers
})
export class SharedModule { }
