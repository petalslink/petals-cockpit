/**
 * Copyright (C) 2016 Linagora
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

// angular modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

// angular-material
import { MaterialModule } from '@angular/material';

// ngrx - store
import { StoreModule } from '@ngrx/store';

// ngrx - effects
import { EffectsModule } from '@ngrx/effects';
import { TranslateModule } from 'ng2-translate';

import { PrettyJsonModule } from 'angular2-prettyjson';

// our components
import { NotFoundComponent } from './components/not-found/not-found.component';
import { ToggleSidenavComponent } from './components/toggle-sidenav/toggle-sidenav.component';

// our directives
import { ColorSearchedLettersDirective } from './directives/color-searched-letters.directive';

// our pipes
import { KeysPipe } from './pipes/keys.pipe';

const SHARED_COMPONENTS = [
  NotFoundComponent,
  ColorSearchedLettersDirective,
  KeysPipe,
  ToggleSidenavComponent
];

const SHARED_MODULES = [
  CommonModule,
  FormsModule,
  HttpModule,
  RouterModule,
  MaterialModule,
  StoreModule,
  EffectsModule,
  TranslateModule,
  PrettyJsonModule
];

@NgModule({
  declarations: [
    ...SHARED_COMPONENTS
  ],
  imports: [
    ...SHARED_MODULES
  ],
  exports: [
    ...SHARED_COMPONENTS,
    ...SHARED_MODULES
  ]
})
export class SharedModule { }
