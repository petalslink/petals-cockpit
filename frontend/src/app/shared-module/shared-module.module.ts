// angular modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// ngrx - store
import { StoreModule } from '@ngrx/store';
// ngrx - effects
import { EffectsModule } from '@ngrx/effects';
import { TranslateModule } from 'ng2-translate';

// our components
import { ToggleThemeComponent } from './toggle-theme/toggle-theme.component';
import { MaterialModule } from '@angular/material';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

const SHARED_COMPONENTS = [
  ToggleThemeComponent
];

const SHARED_MODULES = [
  CommonModule,
  FormsModule,
  HttpModule,
  MaterialModule,
  StoreModule,
  EffectsModule,
  TranslateModule
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
