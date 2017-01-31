import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';

import { IStore } from '../../../../../shared/interfaces/store.interface';
import { getCurrentTree } from '../../../../cockpit/workspaces/state/workspaces/workspaces.selectors';
import { Components } from '../../state/components/components.reducer';
import { Containers } from '../../state/containers/containers.reducer';
import { Buses } from '../../state/buses/buses.reducer';
import { IBusesInProgress } from '../../state/buses-in-progress/buses-in-progress.interface';
import { getBusesInProgress } from '../../state/buses-in-progress/buses-in-progress.selectors';
import { IWorkspacesTable } from './../../state/workspaces/workspaces.interface';
import { BusesService } from './../../../../../shared/services/buses.service';
import { SseWorkspaceEvent } from './../../../../../shared/services/sse.service';

@Component({
  selector: 'app-petals-menu-view',
  templateUrl: './petals-menu-view.component.html',
  styleUrls: ['./petals-menu-view.component.scss']
})
export class PetalsMenuViewComponent implements OnInit {
  public workspaces$: Observable<IWorkspacesTable>;
  public tree$: Observable<any>;
  public busesInProgress$: Observable<IBusesInProgress>;

  constructor(private _store$: Store<IStore>, private _busesService: BusesService) { }

  ngOnInit() {
    this.workspaces$ = this._store$.select(state => state.workspaces);
    this.tree$ = this._store$.let(getCurrentTree());
    this.busesInProgress$ = this._store$.let(getBusesInProgress());
  }

  onTreeToggleFold(e) {
    switch (e.item.typeId) {
      case 'busId':
        this._store$.dispatch({ type: Buses.TOGGLE_FOLD_BUS, payload: { busId: e.item.id } });
        break;
      case 'containerId':
        this._store$.dispatch({ type: Containers.TOGGLE_FOLD_CONTAINER, payload: { containerId: e.item.id } });
        break;
      case 'componentId':
        this._store$.dispatch({ type: Components.TOGGLE_FOLD_COMPONENT, payload: { componentId: e.item.id } });
    }
  }

  onTreeSelect(e) {
    // TODO: Dispatch an action to save the current bus/container/component/su
    // Instead of dispatching it from here maybe it's a better idea to dispatch it once the
    // component is loaded
  }
}
