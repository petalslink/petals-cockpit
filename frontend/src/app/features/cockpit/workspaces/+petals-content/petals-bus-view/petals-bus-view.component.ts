import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

import { Ui } from './../../../../../shared/state/ui.reducer';
import { IStore } from './../../../../../shared/interfaces/store.interface';

@Component({
  selector: 'app-petals-bus-view',
  templateUrl: './petals-bus-view.component.html',
  styleUrls: ['./petals-bus-view.component.scss']
})
export class PetalsBusViewComponent implements OnInit {
  constructor(private _store$: Store<IStore>) { }

  ngOnInit() {
    this._store$.dispatch({ type: Ui.SET_TITLES, payload: { titleMainPart1: 'Petals', titleMainPart2: 'Bus' } });
  }
}
