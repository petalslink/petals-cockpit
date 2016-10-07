// angular modules
import { NgModule } from '@angular/core';

// our modules
import { SharedModule } from '../../../../shared-module/shared-module.module';

// our components
import { ServiceModuleComponent } from './service-module.component';
import { ServiceComponent } from './service/service.component';

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [
    ServiceModuleComponent,
    ServiceComponent
  ]
})
export class ServiceModule { }
