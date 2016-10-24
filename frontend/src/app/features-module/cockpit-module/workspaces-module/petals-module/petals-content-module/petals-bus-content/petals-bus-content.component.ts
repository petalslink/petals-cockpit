// angular modules
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// ngrx
import { Store } from '@ngrx/store';

// our interfaces
import { IBus } from '../../../../../../shared-module/interfaces/petals.interface';

// our states
import { AppState, AppStateRecord } from '../../../../../../app.state';

@Component({
  selector: 'app-petals-bus-content',
  templateUrl: './petals-bus-content.component.html',
  styleUrls: ['./petals-bus-content.component.scss']
})
export class PetalsBusContentComponent implements OnInit {
  private bus: IBus;

  // is the bus being imported ?
  private busInImport: boolean;

  constructor(private store: Store<AppState>, private route: ActivatedRoute) {
  }

  ngOnInit() {
    let store$ = this.store.select('workspaces');
    let params$ = this.route.params;

    store$.combineLatest(params$, (storeRecord: AppStateRecord, params) => {
      let store = storeRecord.toJS();

      if (typeof store.workspaces === 'undefined' || store.workspaces === null) {
        return;
      }

      let workspaceIndex = store.workspaces.findIndex(w => w.id === params['idWorkspace']);

      this.busInImport = store.workspaces[workspaceIndex].busesInProgress.filter(bus => bus.id === params['idBus']).length > 0;

      if (this.busInImport) {
        this.bus = store.workspaces[workspaceIndex].busesInProgress.filter(bus => bus.id === params['idBus'])[0];
      }

      else {
        this.bus = store.workspaces[workspaceIndex].buses.filter(bus => bus.id === params['idBus'])[0];
      }
    })
    .subscribe();
  }
}
