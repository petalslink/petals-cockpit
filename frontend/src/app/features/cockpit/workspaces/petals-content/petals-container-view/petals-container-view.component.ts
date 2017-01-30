import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { IStore } from '../../../../../shared/interfaces/store.interface';
import { Containers } from '../../state/containers/containers.reducer';
import { Ui } from '../../../../../shared/state/ui.reducer';
import { IContainerRow } from '../../state/containers/container.interface';
import { getCurrentContainer } from '../../state/containers/containers.selectors';

@Component({
  selector: 'app-petals-container-view',
  templateUrl: './petals-container-view.component.html',
  styleUrls: ['./petals-container-view.component.scss']
})
export class PetalsContainerViewComponent implements OnInit, OnDestroy {
  public container$: Observable<IContainerRow>;

  constructor(private _store$: Store<IStore>, private _route: ActivatedRoute) { }

  ngOnInit() {
    this.container$ = this._store$.let(getCurrentContainer());

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
