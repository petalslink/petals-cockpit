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

import { ObserversModule } from '@angular/cdk/observers';
import { PlatformModule } from '@angular/cdk/platform';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatCardModule,
  MatDialogModule,
  MatExpansionModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRippleModule,
  MatSidenavModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
} from '@angular/material';

import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { NgxHoverOpacityModule } from 'ngx-hover-opacity';
import { NgPipesModule } from 'ngx-pipes';

import { UpdateFileInformationDirective } from 'app/shared/components/upload/update-file-information.directive';
import { UploadComponent } from 'app/shared/components/upload/upload.component';
import { FocusInputIfLargeScreenDirective } from 'app/shared/directives/focus-input-based-on-screen-size.directive';
import { GenerateIconComponent } from './components/generate-icon/generate-icon.component';
import { LedComponent } from './components/led/led.component';
import { MdCardToolbarComponent } from './components/md-card-toolbar/md-card-toolbar.component';
import { MessageComponent } from './components/message/message.component';
import { NotFound404Component } from './components/not-found-404/not-found-404.component';
import { ColorSearchedLettersDirective } from './directives/color-searched-letters.directive';

export const MaterialModules = [
  MatButtonModule,
  MatCardModule,
  MatIconModule,
  MatInputModule,
  MatDialogModule,
  MatExpansionModule,
  MatListModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRippleModule,
  MatSidenavModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatAutocompleteModule,
  MatRippleModule,
  ObserversModule,
  PlatformModule,
];

// used by the components in declarations below
export const imports = [
  ...MaterialModules,
  CommonModule,
  FlexLayoutModule,
  FormsModule,
  NgxHoverOpacityModule,
  NgPipesModule,
];

export const declarations = [
  GenerateIconComponent,
  ColorSearchedLettersDirective,
  NotFound404Component,
  LedComponent,
  FocusInputIfLargeScreenDirective,
  MessageComponent,
  MdCardToolbarComponent,
  UploadComponent,
  UpdateFileInformationDirective,
];

export const exportss = [
  ReactiveFormsModule,
  // MatIconModule is relying on it so we do need to keep HttpModule for now because
  HttpClientModule,
  HttpModule,
  RouterModule,
  StoreModule,
  SimpleNotificationsModule,
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
