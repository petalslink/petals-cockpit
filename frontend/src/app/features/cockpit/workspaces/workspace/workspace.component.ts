/**
 * Copyright (C) 2017 Linagora
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Component, OnInit, Inject } from '@angular/core';
import { MdDialog, MdDialogRef, MD_DIALOG_DATA } from '@angular/material';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { Ui } from '../../../../shared/state/ui.reducer';
import { IStore } from '../../../../shared/interfaces/store.interface';
import { IWorkspace } from './../state/workspaces/workspace.interface';
import { getCurrentWorkspace } from '../../../cockpit/workspaces/state/workspaces/workspaces.selectors';
import { Workspaces } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.reducer';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss']
})
export class WorkspaceComponent implements OnInit {
  public isRemovingWorkspace$: Observable<boolean>;
  public workspace$: Observable<IWorkspace>;

  constructor(private store$: Store<IStore>, public dialog: MdDialog) { }

  ngOnInit() {
    this.store$.dispatch({ type: Ui.SET_TITLES, payload: { titleMainPart1: 'Petals', titleMainPart2: '' } });

    this.workspace$ = this.store$.let(getCurrentWorkspace());

    this.isRemovingWorkspace$ = this.store$.select(state => state.workspaces.isRemovingWorkspace);
  }

  openDeletionDialog() {
    this.dialog.open(WorkspaceDeleteDialogComponent, {
      data: { workspace$: this.workspace$ }
    })
      .afterClosed()
      .subscribe((result: boolean) => {
        if (result) {
          this.store$.dispatch({ type: Workspaces.DELETE_WORKSPACE });
        }
      });
  }
}

@Component({
  selector: 'app-workspace-deletion-dialog',
  template: `
    <div fxLayout="column" class="content content-max-width">
      <div class="central-content">
        <div fxLayout="row" md-dialog-title fxLayoutAlign="start start">
          <span fxLayoutAlign="start center">
            <md-icon color="warn">warning</md-icon>
            <span class="margin-left-x1">Delete workspace?</span>
          </span>
        </div>
        <md-dialog-content>
          <div fxLayout="column" fxFill>
              <label>Everything in the workspace will be deleted!</label>
              <p>Are you sure you want to delete <b>{{ (data.workspace$ | async).name }}</b>?</p>
          </div>
        </md-dialog-content>

        <md-dialog-actions class="margin-top-x1" fxLayout="row" fxLayoutAlign="end center">
          <button md-button md-dialog-close class="margin-right-x1">Cancel</button>
          <button md-raised-button color="warn" class="btn-confirm-delete-wks" (click)="dialogRef.close(true)">Delete</button>
        </md-dialog-actions>
      </div>
    </div>
  `,
  styles: ['md-dialog-content { height: 100%; } .central-content { padding: 24px; }']
})
export class WorkspaceDeleteDialogComponent {
  constructor(
    public dialogRef: MdDialogRef<WorkspaceDeleteDialogComponent>,
    // TODO add some type for data when https://github.com/angular/angular/issues/15424 is fixed
    @Inject(MD_DIALOG_DATA) public data: any
  ) { }
}
