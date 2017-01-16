import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { Components } from '../../state/components/components.reducer';
import { IStore } from '../../../../../shared/interfaces/store.interface';
import { Ui } from '../../../../../shared/state/ui.reducer';
import { IComponentRow } from '../../state/components/component.interface';
import { getCurrentComponent } from '../../state/components/components.selectors';

@Component({
  selector: 'app-petals-component-view',
  templateUrl: './petals-component-view.component.html',
  styleUrls: ['./petals-component-view.component.scss']
})
export class PetalsComponentViewComponent implements OnInit, OnDestroy {
  public component$: Observable<IComponentRow>;

  constructor(private _store$: Store<IStore>, private _route: ActivatedRoute) { }

  ngOnInit() {
    this.component$ = this._store$.let(getCurrentComponent());

    this._store$.dispatch({ type: Ui.SET_TITLES, payload: { titleMainPart1: 'Petals', titleMainPart2: 'Component' } });

    this._route
      .params
      .map((params: { workspaceId: string, componentId: string }) => {
        this._store$.dispatch({ type: Components.SET_CURRENT_COMPONENT, payload: { componentId: params.componentId } });
      })
      .subscribe();
  }

  ngOnDestroy() {
    this._store$.dispatch({ type: Components.SET_CURRENT_COMPONENT, payload: { componentId: '' } });
  }
}
