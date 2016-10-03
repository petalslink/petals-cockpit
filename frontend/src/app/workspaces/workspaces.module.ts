import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkspacesComponent } from './workspaces.component';
import { MaterialModule } from '@angular/material';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    SharedModule
  ],
  declarations: [WorkspacesComponent]
})
export class WorkspacesModule { }
