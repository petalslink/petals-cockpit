import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkspacesComponent } from './workspaces.component';
import { MaterialModule } from '@angular/material';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule
  ],
  declarations: [WorkspacesComponent]
})
export class WorkspacesModule { }
