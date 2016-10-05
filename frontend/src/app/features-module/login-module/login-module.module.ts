import { NgModule } from '@angular/core';
import { LoginComponent } from './login/login.component';
import {SharedModule} from "../../shared-module/shared-module.module";

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [LoginComponent],
  exports: [
    LoginComponent
  ]
})
export class LoginModule { }
