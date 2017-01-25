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
