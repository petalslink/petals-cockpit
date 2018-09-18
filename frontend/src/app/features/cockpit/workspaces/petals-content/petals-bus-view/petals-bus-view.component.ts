/**
 * Copyright (C) 2017-2018 Linagora
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
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, first, switchMap, tap } from 'rxjs/operators';

import { IStore } from '@shared/state/store.interface';
import { Ui } from '@shared/state/ui.actions';
import { Buses } from '@wks/state/buses/buses.actions';
import {
  getCurrentBus,
  IBusWithContainers,
} from '@wks/state/buses/buses.selectors';

@Component({
  selector: 'app-petals-bus-view',
  templateUrl: './petals-bus-view.component.html',
  styleUrls: ['./petals-bus-view.component.scss'],
})
export class PetalsBusViewComponent implements OnInit {
  public workspaceId$: Observable<string>;
  public bus$: Observable<IBusWithContainers>;

  constructor(private store$: Store<IStore>, public dialog: MatDialog) {}

  ngOnInit() {
    this.store$.dispatch(
      new Ui.SetTitles({ titleMainPart1: 'Petals', titleMainPart2: 'Bus' })
    );

    this.workspaceId$ = this.store$.pipe(
      select(state => state.workspaces.selectedWorkspaceId)
    );

    this.bus$ = this.store$.pipe(select(getCurrentBus));
  }

  openDeletionDialog() {
    this.bus$
      .pipe(
        first(),
        switchMap(bus =>
          this.dialog
            .open(BusDeleteDialogComponent, {
              data: { bus },
            })
            .afterClosed()
            .pipe(
              filter((result: boolean) => result),
              tap(_ => this.store$.dispatch(new Buses.Delete(bus)))
            )
        )
      )
      .subscribe();
  }
}

@Component({
  selector: 'app-bus-deletion-dialog',
  template: `
    <div fxLayout="column" class="content">
      <div class="central-content">
        <div fxLayout="row" matDialogTitle fxLayoutAlign="start start">
          <span fxLayoutAlign="start center">
            <mat-icon color="accent">warning</mat-icon>
            <span class="warning-title margin-left-x1">Delete bus?</span>
          </span>
        </div>
        <mat-dialog-content>
          <p fxLayout="column" class="mat-body-1">
            <span class="warning-message">Are you sure you want to delete <b>{{ data.bus.name }}</b>?</span>
          </p>
        </mat-dialog-content>

        <mat-dialog-actions class="margin-top-x1" fxLayout="row" fxLayoutAlign="end center">
          <button mat-button matDialogClose class="margin-right-x1">Cancel</button>
          <button mat-raised-button color="warn" class="btn-confirm-delete-bus" (click)="dialogRef.close(true)">Delete</button>
        </mat-dialog-actions>
      </div>
    </div>
  `,
  styles: ['.central-content { padding: 24px; }'],
})
export class BusDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<BusDeleteDialogComponent>,
    // TODO add some type for data when https://github.com/angular/angular/issues/15424 is fixed
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}
