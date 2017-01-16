import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

import { IStore } from './../../../../../shared/interfaces/store.interface';
import { Ui } from './../../../../../shared/state/ui.reducer';

@Component({
  selector: 'app-petals-bus-import-view',
  templateUrl: './petals-bus-import-view.component.html',
  styleUrls: ['./petals-bus-import-view.component.scss']
})
export class PetalsBusImportViewComponent implements OnInit {
  constructor(private _store$: Store<IStore>) { }

  ngOnInit() {
    this._store$.dispatch({ type: Ui.SET_TITLES, payload: { titleMainPart1: 'Petals', titleMainPart2: 'Import bus' } });
  }
}
