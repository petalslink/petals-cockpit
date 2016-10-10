// angular modules
import { NgModule } from '@angular/core';

// our modules
import { SharedModule } from '../../../../shared-module/shared-module.module';

// our components
import { ServiceModuleComponent } from './service-module.component';

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [
    ServiceModuleComponent
  ]
})
export class ServiceModule { }
