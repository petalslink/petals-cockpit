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

import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { StoreModule } from '@ngrx/store';
import { PrettyJsonModule } from 'angular2-prettyjson';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { NgObjectPipesModule } from 'ngx-pipes';
import {
  MdButtonModule,
  MdCardModule,
  MdDialogModule,
  MdExpansionModule,
  MdIconModule,
  MdInputModule,
  MdListModule,
  MdProgressSpinnerModule,
  MdRippleModule,
  MdSidenavModule,
  MdTabsModule,
  MdToolbarModule,
  MdTooltipModule,
  MdProgressBarModule,
  MdAutocompleteModule,
} from '@angular/material';

import { GenerateIconComponent } from './components/generate-icon/generate-icon.component';
import { ColorSearchedLettersDirective } from './directives/color-searched-letters.directive';
import { UploadComponent } from 'app/shared/components/upload/upload.component';
import { NotFound404Component } from './components/not-found-404/not-found-404.component';
import { StateLedComponent } from './components/state-led/state-led.component';

export const MaterialModules = [
  MdDialogModule,
  MdExpansionModule,
  MdListModule,
  MdProgressBarModule,
  MdProgressSpinnerModule,
  MdRippleModule,
  MdSidenavModule,
  MdTabsModule,
  MdToolbarModule,
  MdTooltipModule,
  MdAutocompleteModule,
];

// used by the components in declarations below
export const imports = [
  CommonModule,
  MdCardModule,
  MdInputModule,
  MdIconModule,
  MdButtonModule,
  FlexLayoutModule,
  FormsModule,
];

export const declarations = [
  GenerateIconComponent,
  ColorSearchedLettersDirective,
  UploadComponent,
  NotFound404Component,
  StateLedComponent,
];

export const exportss = [
  ReactiveFormsModule,
  HttpModule,
  RouterModule,
  StoreModule,
  PrettyJsonModule,
  SimpleNotificationsModule,
  NgObjectPipesModule,
  ...imports,
  ...MaterialModules,
  ...declarations,
];

@NgModule({
  imports,
  exports: exportss,
  declarations,
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [],
    };
  }
}
