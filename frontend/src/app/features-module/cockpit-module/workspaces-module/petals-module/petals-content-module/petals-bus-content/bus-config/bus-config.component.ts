import { List } from 'immutable';
import { Component, OnInit } from '@angular/core';
import { IBus } from '../../../../../../../shared-module/interfaces/petals.interface'
import { ActivatedRoute } from '@angular/router';
import { AppState } from '../../../../../../../app.state';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
import { WorkspacesStateRecord, WorkspacesState } from '../../../../../../../shared-module/reducers/workspaces.state';

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

  constructor(private route: ActivatedRoute, private store: Store<AppState>) {
    this.workspaces$ = <Observable<WorkspacesStateRecord>>this.store.select('workspaces');

    this.workspaces$.subscribe((workspaces: WorkspacesStateRecord) => {
      this.workspaces = workspaces;
      this.idSelectedWorkspace = workspaces.get('selectedWorkspaceId');
    });
  };

  ngOnInit() {
    this.route.params
      .map(params => params['idBus'])
      .subscribe(idBus => {
        let indexWorkspace = this.workspaces
          .get('workspaces')
          .findIndex(w => w.get('id') === this.idSelectedWorkspace);

        let indexBus = this.workspaces
          .getIn(['workspaces', indexWorkspace, 'buses'])
          .findIndex(b => b.get('id') === idBus);

        this.bus = this.workspaces.getIn(['workspaces', indexWorkspace, 'buses', indexBus]).toJS();
        console.log(this.bus);
      });
  }

  saveBusConfig(){
    //alert(`saved!!! ${JSON.stringify('this.bus')}`);
  };

}
