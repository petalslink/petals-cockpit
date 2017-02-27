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
import { ColorSearchedLettersDirective } from './directives/color-searched-letters.directive';

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

export const declarations = [GenerateIconComponent, ColorSearchedLettersDirective];

@NgModule({
  imports: modules,
  exports: [...modules, ...declarations],
  declarations
})
export class SharedModule { }
