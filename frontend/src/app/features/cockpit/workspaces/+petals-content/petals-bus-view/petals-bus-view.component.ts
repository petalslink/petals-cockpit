import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { Buses } from './../../state/buses/buses.reducer';
import { IBusRow } from './../../state/buses/bus.interface';
import { Ui } from './../../../../../shared/state/ui.reducer';
import { IStore } from './../../../../../shared/interfaces/store.interface';
import { getCurrentBus } from './../../state/buses/buses.selectors';

@Component({
  selector: 'app-petals-bus-view',
  templateUrl: './petals-bus-view.component.html',
  styleUrls: ['./petals-bus-view.component.scss']
})
export class PetalsBusViewComponent implements OnInit, OnDestroy {
  public bus$: Observable<IBusRow>;

  constructor(private _store$: Store<IStore>, private _route: ActivatedRoute) { }

  ngOnInit() {
    this._store$.dispatch({ type: Ui.SET_TITLES, payload: { titleMainPart1: 'Petals', titleMainPart2: 'Bus' } });

    this._route
      .params
      .map((params: { workspaceId: string, busId: string }) => {
        this._store$.dispatch({ type: Buses.SET_CURRENT_BUS, payload: { busId: params.busId } });
      })
      .subscribe();

    this.bus$ = this._store$.let(getCurrentBus());
  }

  ngOnDestroy() {
    this._store$.dispatch({ type: Buses.SET_CURRENT_BUS, payload: { busId: '' } });
  }
}
