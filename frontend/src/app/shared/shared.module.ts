/**
 * Copyright (C) 2017-2019 Linagora
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

import { ScrollDispatchModule } from '@angular/cdk/scrolling';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { NgxHoverOpacityModule } from 'ngx-hover-opacity';
import { NgPipesModule } from 'ngx-pipes';

import { GenerateIconComponent } from './components/generate-icon/generate-icon.component';
import { LedComponent } from './components/led/led.component';
import { LoadingComponent } from './components/loading/loading.component';
import { MaterialTreeComponent } from './components/material-tree/material-tree.component';
import { MdCardToolbarComponent } from './components/md-card-toolbar/md-card-toolbar.component';
import { MenuComponent } from './components/menu/menu.component';
import { MessageComponent } from './components/message/message.component';
import { NotFound404Component } from './components/not-found-404/not-found-404.component';
import { SettingsThemeColorComponent } from './components/settings-theme-color/settings-theme-color.component';
import { UpdateFileInformationDirective } from './components/upload/update-file-information.directive';
import { UploadComponent } from './components/upload/upload.component';
import { ColorSearchedLettersDirective } from './directives/color-searched-letters.directive';
import { FocusInputIfLargeScreenDirective } from './directives/focus-input-based-on-screen-size.directive';
import { FocusInputDirective } from './directives/focus-input.directive';
import { TruncateStringPipe } from './helpers/truncate-string.pipe';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';

export const MaterialModules = [
  MatBadgeModule,
  MatButtonModule,
  MatCardModule,
  MatChipsModule,
  MatIconModule,
  MatInputModule,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatGridListModule,
  MatListModule,
  MatMenuModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatSidenavModule,
  MatSelectModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatAutocompleteModule,
  ObserversModule,
  PlatformModule,
  ScrollDispatchModule,
];

import {
  faCog,
  faEllipsisV,
  faEye,
  faEyeSlash,
  faFolderOpen,
  faFolderPlus,
  faIdBadge,
  faKey,
  faPlusCircle,
  faSignInAlt,
  faSignOutAlt,
  faTicketAlt,
  faUserAstronaut,
  faUserCircle,
  faUserFriends,
} from '@fortawesome/free-solid-svg-icons';

import { faFolder } from '@fortawesome/free-regular-svg-icons';

library.add(
  faCog,
  faEllipsisV,
  faEye,
  faEyeSlash,
  faFolder,
  faFolderOpen,
  faFolderPlus,
  faIdBadge,
  faKey,
  faPlusCircle,
  faSignInAlt,
  faSignOutAlt,
  faTicketAlt,
  faUserAstronaut,
  faUserCircle,
  faUserFriends
);

// used by the components in declarations below
export const imports = [
  ...MaterialModules,
  CommonModule,
  FlexLayoutModule,
  FormsModule,
  NgxHoverOpacityModule,
  NgPipesModule,
  RouterModule,
  ReactiveFormsModule,
  FontAwesomeModule,
];

export const declarations = [
  GenerateIconComponent,
  ColorSearchedLettersDirective,
  NotFound404Component,
  LedComponent,
  LoadingComponent,
  FocusInputDirective,
  FocusInputIfLargeScreenDirective,
  MessageComponent,
  MdCardToolbarComponent,
  UploadComponent,
  UpdateFileInformationDirective,
  MaterialTreeComponent,
  TruncateStringPipe,
  SettingsThemeColorComponent,
  MenuComponent,
];

export const exportss = [
  // MatIconModule is relying on it so we do need to keep HttpClientModule for now because
  HttpClientModule,
  RouterModule,
  StoreModule,
  SimpleNotificationsModule,
  FontAwesomeModule,
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
    return { ngModule: SharedModule, providers: [] };
  }
}
