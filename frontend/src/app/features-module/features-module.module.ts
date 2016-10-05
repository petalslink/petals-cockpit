// angular modules
import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatureComponent } from './features-module.component';


// our routes
import { FeaturesRoutingModule } from './features-module-routing.module';

// our modules
import { LoginModule } from './login-module/login-module.module';
import {FormsModule} from "@angular/forms";
import {SharedModule} from "../shared-module/shared-module.module";
import { CockpitModule } from './cockpit-module/cockpit-module.module';

@NgModule({
  imports: [
    // angular
    SharedModule,

    // routes
    FeaturesRoutingModule,

    // our modules
    LoginModule,
    CockpitModule
  ],
  declarations: [FeatureComponent],
  exports: [
    FeatureComponent
  ]
})
export class FeatureModule { }
