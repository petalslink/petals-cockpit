// angular modules
import { NgModule } from '@angular/core';
import { FeatureComponent } from './features-module.component';

// our modules
import { LoginModule } from './login-module/login-module.module';
import { SharedModule } from '../shared-module/shared-module.module';
import { CockpitModule } from './cockpit-module/cockpit-module.module';

// our routes
import { FeaturesRoutingModule } from './features-module-routing.module';

@NgModule({
  imports: [
    SharedModule,

    // routes
    FeaturesRoutingModule,

    // our modules
    LoginModule,
    CockpitModule
  ],
  declarations: [
    FeatureComponent
  ],
  exports: [
    FeatureComponent
  ]
})
export class FeatureModule { }
