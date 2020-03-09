/**
 * Copyright (C) 2017-2020 Linagora
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
import { MatCheckboxModule } from '@angular/material/checkbox';
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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';

import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { NgxHoverOpacityModule } from 'ngx-hover-opacity';
import { NgPipesModule } from 'ngx-pipes';

import { ConfirmMessageDialogComponent } from './components/confirm-message-dialog/confirm-message-dialog.component';
import { GenerateIconComponent } from './components/generate-icon/generate-icon.component';
import { LedComponent } from './components/led/led.component';
import { LoadingComponent } from './components/loading/loading.component';
import { MaterialTreeComponent } from './components/material-tree/material-tree.component';
import { MenuComponent } from './components/menu/menu.component';
import { MessageComponent } from './components/message/message.component';
import { RemovableComponent } from './components/removable/removable.component';

import { NotFound404Component } from './components/not-found-404/not-found-404.component';
import { SettingsThemeColorComponent } from './components/settings-theme-color/settings-theme-color.component';
import { UpdateFileInformationDirective } from './components/upload/update-file-information.directive';
import {
  SnackBarDeploymentProgressComponent,
  UploadComponent,
} from './components/upload/upload.component';
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
  MatSlideToggleModule,
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
  MatSnackBarModule,
  MatSortModule,
  MatTableModule,
  MatCheckboxModule,
  MatTabsModule,
  MatTreeModule,
  MatToolbarModule,
  MatTooltipModule,
  MatAutocompleteModule,
  ObserversModule,
  PlatformModule,
  ScrollDispatchModule,
];

import {
  faCheck,
  faCog,
  faCogs,
  faEllipsisV,
  faEthernet,
  faEye,
  faEyeSlash,
  faFolderOpen,
  faFolderPlus,
  faIdBadge,
  faKey,
  faLink,
  faMapMarkerAlt,
  faNetworkWired,
  faPencilAlt,
  faPlus,
  faPlusCircle,
  faSearch,
  faServer,
  faShieldAlt,
  faSignInAlt,
  faSignOutAlt,
  faTicketAlt,
  faTimes,
  faTimesCircle,
  faTrashAlt,
  faUnlink,
  faUserAstronaut,
  faUserCircle,
  faUserFriends,
} from '@fortawesome/free-solid-svg-icons';

import { faFolder } from '@fortawesome/free-regular-svg-icons';

library.add(
  faCheck,
  faCog,
  faCogs,
  faEllipsisV,
  faEthernet,
  faEye,
  faEyeSlash,
  faFolder,
  faFolderOpen,
  faFolderPlus,
  faIdBadge,
  faKey,
  faLink,
  faMapMarkerAlt,
  faNetworkWired,
  faPencilAlt,
  faPlus,
  faPlusCircle,
  faSearch,
  faServer,
  faShieldAlt,
  faSignInAlt,
  faSignOutAlt,
  faTicketAlt,
  faTimes,
  faTimesCircle,
  faTrashAlt,
  faUnlink,
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
  UploadComponent,
  UpdateFileInformationDirective,
  MaterialTreeComponent,
  TruncateStringPipe,
  SettingsThemeColorComponent,
  MenuComponent,
  SnackBarDeploymentProgressComponent,
  ConfirmMessageDialogComponent,
  RemovableComponent,
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
  entryComponents: [
    SnackBarDeploymentProgressComponent,
    ConfirmMessageDialogComponent,
  ],
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return { ngModule: SharedModule, providers: [] };
  }
}
