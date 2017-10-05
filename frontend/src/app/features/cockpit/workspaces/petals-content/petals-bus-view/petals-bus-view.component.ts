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

import { Component, Inject, OnInit } from '@angular/core';
import { MD_DIALOG_DATA, MdDialog, MdDialogRef } from '@angular/material';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { Buses } from 'app/features/cockpit/workspaces/state/buses/buses.actions';
import {
  getCurrentBus,
  IBusWithContainers,
} from 'app/features/cockpit/workspaces/state/buses/buses.selectors';
import { IStore } from 'app/shared/state/store.interface';
import { Ui } from 'app/shared/state/ui.actions';

@Component({
  selector: 'app-petals-bus-view',
  templateUrl: './petals-bus-view.component.html',
  styleUrls: ['./petals-bus-view.component.scss'],
})
export class PetalsBusViewComponent implements OnInit {
  public workspaceId$: Observable<string>;
  public bus$: Observable<IBusWithContainers>;

  constructor(private store$: Store<IStore>, public dialog: MdDialog) {}

  ngOnInit() {
    this.store$.dispatch(
      new Ui.SetTitles({ titleMainPart1: 'Petals', titleMainPart2: 'Bus' })
    );

    this.workspaceId$ = this.store$.select(
      state => state.workspaces.selectedWorkspaceId
    );

    this.bus$ = this.store$.select(getCurrentBus);
  }

  openDeletionDialog() {
    this.bus$
      .first()
      .switchMap(bus =>
        this.dialog
          .open(BusDeleteDialogComponent, {
            data: { bus },
          })
          .afterClosed()
          .filter((result: boolean) => result)
          .do(_ => this.store$.dispatch(new Buses.Delete(bus)))
      )
      .subscribe();
  }
}

@Component({
  selector: 'app-bus-deletion-dialog',
  template: `
    <div fxLayout="column" class="content content-max-width">
      <div class="central-content">
        <div fxLayout="row" md-dialog-title fxLayoutAlign="start start">
          <span fxLayoutAlign="start center">
            <md-icon color="accent">warning</md-icon>
            <span class="warning-title margin-left-x1">Delete bus?</span>
          </span>
        </div>
        <md-dialog-content>
          <p fxLayout="column">
            <span class="warning-message">Are you sure you want to delete <b>{{ data.bus.name }}</b>?</span>
          </p>
        </md-dialog-content>

        <md-dialog-actions class="margin-top-x1" fxLayout="row" fxLayoutAlign="end center">
          <button md-button md-dialog-close class="margin-right-x1">Cancel</button>
          <button md-raised-button color="warn" class="btn-confirm-delete-bus" (click)="dialogRef.close(true)">Delete</button>
        </md-dialog-actions>
      </div>
    </div>
  `,
  styles: [
    'md-dialog-content { height: 100%; } .central-content { padding: 24px; }',
  ],
})
export class BusDeleteDialogComponent {
  constructor(
    public dialogRef: MdDialogRef<BusDeleteDialogComponent>,
    // TODO add some type for data when https://github.com/angular/angular/issues/15424 is fixed
    @Inject(MD_DIALOG_DATA) public data: any
  ) {}
}
