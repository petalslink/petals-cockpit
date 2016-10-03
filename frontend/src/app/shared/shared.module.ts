import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// angular-material2 modules
import { MaterialModule } from '@angular/material';

import { ToggleThemeComponent } from './toggle-theme/toggle-theme.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule
  ],
  exports: [
    ToggleThemeComponent
  ],
  declarations: [ToggleThemeComponent]
})
export class SharedModule { }
