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

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';

import { Buses } from '../../state/buses/buses.reducer';
import { IBusRow } from '../../state/buses/bus.interface';
import { Ui } from '../../../../../shared/state/ui.reducer';
import { IStore } from '../../../../../shared/interfaces/store.interface';
import { getCurrentBus } from '../../state/buses/buses.selectors';

@Component({
  selector: 'app-petals-bus-view',
  templateUrl: './petals-bus-view.component.html',
  styleUrls: ['./petals-bus-view.component.scss']
})
export class PetalsBusViewComponent implements OnInit, OnDestroy {
  public bus$: Observable<IBusRow>;

  private sub: Subscription;

  constructor(private store$: Store<IStore>, private route: ActivatedRoute) { }

  ngOnInit() {
    this.store$.dispatch({ type: Ui.SET_TITLES, payload: { titleMainPart1: 'Petals', titleMainPart2: 'Bus' } });

    this.sub = this.route.paramMap
      .map(pm => pm.get('busId'))
      .subscribe(busId => {
        this.store$.dispatch({ type: Buses.SET_CURRENT_BUS, payload: { busId } });
        this.store$.dispatch({ type: Buses.FETCH_BUS_DETAILS, payload: { busId } });
      });

    this.bus$ = this.store$.let(getCurrentBus);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.store$.dispatch({ type: Buses.SET_CURRENT_BUS, payload: { busId: '' } });
  }
}
