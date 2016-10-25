// angular modules
import { Component, Input, OnInit } from '@angular/core';

// rxjs
import { Observable } from 'rxjs';

// ngrx
import { Store } from '@ngrx/store';

// our states
import { AppState } from '../../../../../../../app.state';
import { WorkspacesState, WorkspacesStateRecord } from '../../../../../../../shared-module/reducers/workspaces.state';

// our interfaces
import { INewBus } from '../../../../../../../shared-module/interfaces/petals.interface';

// our actions
import { IMPORTING_BUS } from '../../../../../../../shared-module/reducers/workspaces.reducer';

@Component({
  selector: 'app-petals-bus-import',
  templateUrl: './petals-bus-import.component.html',
  styleUrls: ['./petals-bus-import.component.scss']
})
export class PetalsBusImportComponent implements OnInit {
  @Input() importing = false;
  @Input() newBus?: any;
  private workspaces$: Observable<WorkspacesState>;

  constructor(private store: Store<AppState>) {
    this.workspaces$ = <Observable<WorkspacesStateRecord>>store.select('workspaces');
  }

  ngOnInit() {
    if (typeof this.newBus === 'undefined') {
      this.newBus = {
        ip: '',
        port: '',
        login: '',
        password: ''
      };
    }
  }

  importBus(newBus: INewBus) {
    this.store.dispatch({ type: IMPORTING_BUS, payload: newBus });
  }
}
