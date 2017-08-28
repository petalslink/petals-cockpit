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

import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MD_DIALOG_DATA, MdDialog, MdDialogRef } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { IStore } from '../../../../../shared/state/store.interface';
import {
  getCurrentBus,
  IBusWithContainers,
} from '../../state/buses/buses.selectors';

import { Buses } from 'app/features/cockpit/workspaces/state/buses/buses.actions';
import { Containers } from 'app/features/cockpit/workspaces/state/containers/containers.actions';
import { deletable, IDeletable } from 'app/shared/operators/deletable.operator';
import { Ui } from 'app/shared/state/ui.actions';

@Component({
  selector: 'app-petals-bus-view',
  templateUrl: './petals-bus-view.component.html',
  styleUrls: ['./petals-bus-view.component.scss'],
})
export class PetalsBusViewComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  public workspaceId$: Observable<string>;
  public bus$: Observable<IDeletable<IBusWithContainers>>;

  constructor(
    private store$: Store<IStore>,
    private route: ActivatedRoute,
    public dialog: MdDialog
  ) {}

  ngOnInit() {
    this.store$.dispatch(
      new Ui.SetTitles({ titleMainPart1: 'Petals', titleMainPart2: 'Bus' })
    );

    this.workspaceId$ = this.store$.select(
      state => state.workspaces.selectedWorkspaceId
    );

    this.bus$ = this.store$.let(getCurrentBus).let(deletable);

    this.route.paramMap
      .map(pm => pm.get('busId'))
      .takeUntil(this.onDestroy$)
      .do(id => {
        this.store$.dispatch(new Buses.SetCurrent({ id }));
        this.store$.dispatch(new Buses.FetchDetails({ id }));
      })
      .finally(() => this.store$.dispatch(new Buses.SetCurrent({ id: '' })))
      .switchMap(busId =>
        this.bus$
          .first()
          .do(bus =>
            bus.value.containers.forEach(c =>
              this.store$.dispatch(new Containers.FetchDetails(c))
            )
          )
          .map(_ => busId)
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
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
          .do(_ => this.store$.dispatch(new Buses.Delete(bus.value)))
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
            <md-icon color="warn">warning</md-icon>
            <span class="margin-left-x1">Delete bus?</span>
          </span>
        </div>
        <md-dialog-content>
          <p>Are you sure you want to delete <b>{{ data.bus.name }}</b>?</p>
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
