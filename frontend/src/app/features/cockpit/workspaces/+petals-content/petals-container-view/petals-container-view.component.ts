import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';

import { IStore } from './../../../../../shared/interfaces/store.interface';
import { Containers } from './../../state/containers/containers.reducer';
import { Ui } from './../../../../../shared/state/ui.reducer';

@Component({
  selector: 'app-petals-container-view',
  templateUrl: './petals-container-view.component.html',
  styleUrls: ['./petals-container-view.component.scss']
})
export class PetalsContainerViewComponent implements OnInit {
  constructor(private _store$: Store<IStore>, private _route: ActivatedRoute) { }

  ngOnInit() {
    this._store$.dispatch({ type: Ui.SET_TITLES, payload: { titleMainPart1: 'Petals', titleMainPart2: 'Container' } });

    this._route
      .params
      .map((params: { workspaceId: string, containerId: string }) => {
        this._store$.dispatch({ type: Containers.SET_CURRENT_CONTAINER, payload: { containerId: params.containerId } });
      })
      .subscribe();
  }

  ngOnDestroy() {
    this._store$.dispatch({ type: Containers.SET_CURRENT_CONTAINER, payload: { containerId: '' } });
  }
}
