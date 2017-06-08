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

import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MdDialog, MdDialogRef, MD_DIALOG_DATA } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Store } from '@ngrx/store';

import { Buses } from '../../state/buses/buses.reducer';
import { IBusRow } from '../../state/buses/buses.interface';
import { IContainerRow } from 'app/features/cockpit/workspaces/state/containers/containers.interface';
import { Ui } from '../../../../../shared/state/ui.reducer';
import { IStore } from '../../../../../shared/interfaces/store.interface';
import { getCurrentBus } from '../../state/buses/buses.selectors';
import { getContainers } from 'app/features/cockpit/workspaces/state/containers/containers.selectors';
import { Containers } from 'app/features/cockpit/workspaces/state/containers/containers.reducer';

@Component({
  selector: 'app-petals-bus-view',
  templateUrl: './petals-bus-view.component.html',
  styleUrls: ['./petals-bus-view.component.scss'],
})
export class PetalsBusViewComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  public workspaceId$: Observable<string>;
  public bus$: Observable<IBusRow>;
  public containers$: Observable<IContainerRow[]>;

  constructor(
    private store$: Store<IStore>,
    private route: ActivatedRoute,
    public dialog: MdDialog
  ) {}

  ngOnInit() {
    this.store$.dispatch({
      type: Ui.SET_TITLES,
      payload: { titleMainPart1: 'Petals', titleMainPart2: 'Bus' },
    });

    this.workspaceId$ = this.route.paramMap
      .map(p => p.get('workspaceId'))
      .distinctUntilChanged();

    this.bus$ = this.store$.let(getCurrentBus);
    this.containers$ = this.store$.let(getContainers);

    this.route.paramMap
      .map(pm => pm.get('busId'))
      .takeUntil(this.onDestroy$)
      .do(busId => {
        this.store$.dispatch({
          type: Buses.SET_CURRENT_BUS,
          payload: { busId },
        });
        this.store$.dispatch({
          type: Buses.FETCH_BUS_DETAILS,
          payload: { busId },
        });
      })
      .switchMap(busId =>
        this.containers$
          .first()
          .do(cs =>
            cs.forEach(c =>
              this.store$.dispatch({
                type: Containers.FETCH_CONTAINER_DETAILS,
                payload: { containerId: c.id },
              })
            )
          )
          .map(_ => busId)
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();

    this.store$.dispatch({
      type: Buses.SET_CURRENT_BUS,
      payload: { busId: '' },
    });
  }

  openDeletionDialog() {
    this.bus$
      .first()
      .switchMap(b =>
        this.dialog
          .open(BusDeleteDialogComponent, {
            data: { bus: b },
          })
          .afterClosed()
          .filter((result: boolean) => result)
          .do(_ =>
            this.store$.dispatch({ type: Buses.DELETE_BUS, payload: b.id })
          )
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
