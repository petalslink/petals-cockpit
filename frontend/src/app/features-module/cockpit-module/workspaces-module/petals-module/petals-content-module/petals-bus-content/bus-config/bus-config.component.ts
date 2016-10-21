// angular modules
import { Component, OnInit } from '@angular/core';

// rxjs
import { Observable } from 'rxjs/Rx';

// ngrx
import { Store } from '@ngrx/store';

// our states
import { AppState } from '../../../../../../../app.state';
import { WorkspacesStateRecord, WorkspacesState } from '../../../../../../../shared-module/reducers/workspaces.state';

// our interfaces
import { IBus } from '../../../../../../../shared-module/interfaces/petals.interface';

// our routes
import { ActivatedRoute } from '@angular/router';

// our reducers
import { FETCHING_BUS_CONFIG } from '../../../../../../../shared-module/reducers/workspaces.reducer';

@Component({
  selector: 'app-bus-config',
  templateUrl: './bus-config.component.html',
  styleUrls: ['./bus-config.component.scss']
})
export class BusConfigComponent implements OnInit {

  private workspaces$: Observable<WorkspacesState>;
  private workspaces: WorkspacesStateRecord;
  private idSelectedWorkspace: number;
  private bus: IBus;
  private idBus: number;

  constructor(private route: ActivatedRoute, private store: Store<AppState>) {
    this.workspaces$ = <Observable<WorkspacesStateRecord>>this.store.select('workspaces');

    this.workspaces$.subscribe((workspaces: WorkspacesStateRecord) => {
      this.workspaces = workspaces;
      this.idSelectedWorkspace = workspaces.get('selectedWorkspaceId');

      if (typeof this.idBus !== 'undefined') {
        let indexWorkspace = this.workspaces
          .get('workspaces')
          .findIndex((workspacesTmp: WorkspacesStateRecord) => workspacesTmp.get('id') === this.idSelectedWorkspace);

        let indexBus = this.workspaces
          .getIn(['workspaces', indexWorkspace, 'buses'])
          .findIndex((buses: WorkspacesStateRecord) => buses.get('id') === this.idBus);

        this.bus = workspaces.getIn(['workspaces', indexWorkspace, 'buses', indexBus]).toJS();
      }
    });
  };

  ngOnInit() {
    this.route.params
      .map(params => params['idBus'])
      .subscribe(idBus => {
        this.idBus = idBus;
        let indexWorkspace = this.workspaces
          .get('workspaces')
          .findIndex((workspaces: WorkspacesStateRecord) => workspaces.get('id') === this.idSelectedWorkspace);

        let indexBus = this.workspaces
          .getIn(['workspaces', indexWorkspace, 'buses'])
          .findIndex((buses: WorkspacesStateRecord) => buses.get('id') === idBus);

        this.bus = this.workspaces.getIn(['workspaces', indexWorkspace, 'buses', indexBus]).toJS();
        this.store.dispatch({ type: FETCHING_BUS_CONFIG, payload: idBus });
      });
  }

  saveBusConfig() {
    alert(`Bus Config Saved !!! ${JSON.stringify(this.bus)}`);
  };
}
