/**
 * Copyright (C) 2017 Linagora
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from 'ng2-translate';
import { PrettyJsonModule } from 'angular2-prettyjson';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { NgObjectPipesModule } from 'ngx-pipes';
import {
  MdButtonModule,
  MdCardModule,
  MdDialogModule,
  MdIconModule,
  MdInputModule,
  MdListModule,
  MdProgressSpinnerModule,
  MdRippleModule,
  MdSidenavModule,
  MdTabsModule,
  MdToolbarModule,
  MdTooltipModule,
} from '@angular/material';

import { GenerateIconComponent } from './components/generate-icon/generate-icon.component';
import { ColorSearchedLettersDirective } from './directives/color-searched-letters.directive';
import { UploadComponent } from 'app/shared/components/upload/upload.component';
import { NotFound404Component } from './components/not-found-404/not-found-404.component';
import { StateLedComponent } from './components/state-led/state-led.component';

export const MaterialModules = [
  MdButtonModule,
  MdCardModule,
  MdDialogModule,
  MdIconModule,
  MdInputModule,
  MdListModule,
  MdProgressSpinnerModule,
  MdRippleModule,
  MdSidenavModule,
  MdTabsModule,
  MdToolbarModule,
  MdTooltipModule,
];

export const modules = [
  CommonModule,
  ReactiveFormsModule,
  FormsModule,
  HttpModule,
  RouterModule,
  FlexLayoutModule,
  StoreModule,
  TranslateModule,
  PrettyJsonModule,
  SimpleNotificationsModule,
  NgObjectPipesModule,
  ...MaterialModules,
];

export const declarations = [
  GenerateIconComponent,
  ColorSearchedLettersDirective,
  UploadComponent,
  NotFound404Component,
  StateLedComponent,
];

@NgModule({
  imports: modules,
  exports: [...modules, ...declarations],
  declarations,
})
export class SharedModule {}
