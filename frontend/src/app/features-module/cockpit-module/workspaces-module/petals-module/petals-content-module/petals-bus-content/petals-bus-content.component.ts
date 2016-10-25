// angular modules
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// rxjs
import { Observable } from 'rxjs/Rx';

// ngrx
import { Store } from '@ngrx/store';

// our interfaces
import { IBus } from '../../../../../../shared-module/interfaces/petals.interface';

// our states
import { AppState } from '../../../../../../app.state';
import { WorkspacesStateRecord, WorkspacesState } from '../../../../../../shared-module/reducers/workspaces.state';

// our reducers
import { FETCHING_BUS_CONFIG } from '../../../../../../shared-module/reducers/workspaces.reducer';

@Component({
  selector: 'app-petals-bus-content',
  templateUrl: './petals-bus-content.component.html',
  styleUrls: ['./petals-bus-content.component.scss']
})
export class PetalsBusContentComponent implements OnInit {
  private bus: IBus;
  private workspaces$: Observable<WorkspacesState>;
  private workspaces: WorkspacesStateRecord;
  private idSelectedWorkspace: string;
  private idBus: string;

  // is the bus being imported ?
  private busInImport: boolean;

  constructor(private store: Store<AppState>, private route: ActivatedRoute) {
    this.workspaces$ = <Observable<WorkspacesStateRecord>>this.store.select('workspaces');
  }

  ngOnInit() {
    let params$ = this.route.params;

    this.workspaces$.combineLatest(params$, (workspaces: WorkspacesStateRecord, params) => {
      this.workspaces = workspaces.toJS();
      this.idSelectedWorkspace = workspaces.selectedWorkspaceId;
      this.idBus = params.idBus;

      if (typeof workspaces.workspaces === 'undefined' || workspaces.workspaces === null) {
        return;
      }

      let workspaceIndex = workspaces.workspaces.findIndex(w => w.id === params['idWorkspace']);

      this.busInImport = workspaces.workspaces[workspaceIndex].busesInProgress.filter(bus => bus.id === params['idBus']).length > 0;

      if (this.busInImport) {
        this.bus = workspaces.workspaces[workspaceIndex].busesInProgress.filter(bus => bus.id === params['idBus'])[0];
      }

      else {
        this.bus = workspaces.workspaces[workspaceIndex].buses.filter(bus => bus.id === params['idBus'])[0];

        this.store.dispatch({type: FETCHING_BUS_CONFIG, payload: this.idBus});
      }
    })
    .subscribe();
  }
}
