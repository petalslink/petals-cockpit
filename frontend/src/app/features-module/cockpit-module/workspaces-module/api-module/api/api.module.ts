import { NgModule } from '@angular/core';
import { ApiComponent } from './api.component';
import { SharedModule } from '../../../../../shared-module/shared-module.module';

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [ApiComponent]
})
export class ApiModule { }
