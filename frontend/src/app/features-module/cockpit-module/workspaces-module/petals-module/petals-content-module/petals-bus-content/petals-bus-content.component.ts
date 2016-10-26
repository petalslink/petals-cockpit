// angular modules
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// rxjs
import { Observable } from 'rxjs/Rx';

// ngrx
import { Store } from '@ngrx/store';

// our interfaces
import { IBus } from '../../../../../../shared-module/interfaces/petals.interface';
import { IWorkspaces } from '../../../../../../shared-module/interfaces/workspace.interface';

// our states
import { AppState } from '../../../../../../app.state';
import { WorkspacesStateRecord, WorkspacesState } from '../../../../../../shared-module/reducers/workspaces.state';

// our reducers
import { FETCH_BUS_CONFIG } from '../../../../../../shared-module/reducers/workspaces.reducer';

@Component({
  selector: 'app-petals-bus-content',
  templateUrl: './petals-bus-content.component.html',
  styleUrls: ['./petals-bus-content.component.scss']
})
export class PetalsBusContentComponent implements OnInit {
  private bus: IBus;
  private workspaces$: Observable<WorkspacesState>;
  private workspaces: IWorkspaces;
  private idSelectedWorkspace: string;
  private idBus: string;

  // is the bus being imported ?
  private busInImport: boolean;

  private shouldFetchBus = false;

  constructor(private store: Store<AppState>, private route: ActivatedRoute) {
    this.workspaces$ = <Observable<WorkspacesStateRecord>>this.store.select('workspaces')
      .map((workspaces: WorkspacesStateRecord) => workspaces.toJS());
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.shouldFetchBus = true;
    });

    this.workspaces$.combineLatest(this.route.params, (workspaces: WorkspacesState, params) => {
      this.idBus = params.idBus;
      this.workspaces = workspaces;
      this.idSelectedWorkspace = workspaces.selectedWorkspaceId;

      this.updateBus();
    })
    .subscribe();
  }

  updateBus() {
    if (typeof this.workspaces.workspaces === 'undefined' || this.workspaces.workspaces === null) {
      return;
    }

    let workspaceIndex = this.workspaces.workspaces.findIndex(w => w.id === this.idSelectedWorkspace);

    this.busInImport = this.workspaces.workspaces[workspaceIndex].busesInProgress.filter(bus => bus.id === this.idBus).length > 0;

    if (this.busInImport) {
      this.bus = this.workspaces.workspaces[workspaceIndex].busesInProgress.filter(bus => bus.id === this.idBus)[0];
    }

    else {
      this.bus = this.workspaces.workspaces[workspaceIndex].buses.filter(bus => bus.id === this.idBus)[0];

      if (this.shouldFetchBus) {
        this.store.dispatch({ type: FETCH_BUS_CONFIG, payload: this.idBus });
        this.shouldFetchBus = false;
      }
    }
  }
}
