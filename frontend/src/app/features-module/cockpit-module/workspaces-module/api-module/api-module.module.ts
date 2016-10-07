// angular modules
import { NgModule } from '@angular/core';

// our modules
import { SharedModule } from '../../../../shared-module/shared-module.module';

// our components
import { ApiModuleComponent } from './api-module.component';
import { ApiComponent } from './api/api.component';

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [
    ApiModuleComponent,
    ApiComponent
  ]
})
export class ApiModule { }
