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

import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import {
  MdAutocompleteModule,
  MdButtonModule,
  MdCardModule,
  MdDialogModule,
  MdExpansionModule,
  MdIconModule,
  MdInputModule,
  MdListModule,
  MdProgressBarModule,
  MdProgressSpinnerModule,
  MdRippleModule,
  MdSidenavModule,
  MdTabsModule,
  MdToolbarModule,
  MdTooltipModule,
} from '@angular/material';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { PrettyJsonModule } from 'angular2-prettyjson';
import { NgxHoverOpacityModule } from 'ngx-hover-opacity';

import { UploadComponent } from 'app/shared/components/upload/upload.component';
import { NgArrayPipesModule, NgObjectPipesModule } from 'ngx-pipes';
import { GenerateIconComponent } from './components/generate-icon/generate-icon.component';
import { LedComponent } from './components/led/led.component';
import { NotFound404Component } from './components/not-found-404/not-found-404.component';
import { ColorSearchedLettersDirective } from './directives/color-searched-letters.directive';

export const MaterialModules = [
  MdButtonModule,
  MdCardModule,
  MdIconModule,
  MdInputModule,
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
  ...MaterialModules,
  CommonModule,
  FlexLayoutModule,
  FormsModule,
  NgxHoverOpacityModule,
];

export const declarations = [
  GenerateIconComponent,
  ColorSearchedLettersDirective,
  UploadComponent,
  NotFound404Component,
  LedComponent,
];

export const exportss = [
  ReactiveFormsModule,
  HttpModule,
  RouterModule,
  StoreModule,
  PrettyJsonModule,
  SimpleNotificationsModule,
  NgObjectPipesModule,
  NgArrayPipesModule,
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
