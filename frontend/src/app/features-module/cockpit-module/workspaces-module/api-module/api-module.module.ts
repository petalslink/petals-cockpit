// angular modules
import { NgModule } from '@angular/core';

// our modules
import { SharedModule } from '../../../../shared-module/shared-module.module';

// our components
import { ApiModuleComponent } from './api-module.component';

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [
    ApiModuleComponent
  ]
})
export class ApiModule { }
