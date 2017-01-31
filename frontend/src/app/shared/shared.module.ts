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
import { environment } from './../../environments/environment';
import { SseService } from './services/sse.service';
import { SseServiceMock } from './services/sse.service.mock';
import { BusesInProgressService } from './services/buses-in-progress.service';
import { BusesInProgressMockService } from './services/buses-in-progress-mock.service';
import { WorkspacesService } from './services/workspaces.service';
import { WorkspacesMockService } from './services/workspaces.mock';
import { UsersMockService } from './services/users.mock';
import { UsersService } from './services/users.service';
import { GuardLoginService } from './services/guard-login.service';
import { GuardAppService } from './services/guard-app.service';
import { BusesService } from './services/buses.service';
import { BusesMockService } from './services/buses.service.mock';

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

@NgModule({
  imports: modules,
  exports: [...modules, ...declarations],
  declarations
})
export class SharedModule { }
