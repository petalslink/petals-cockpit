// angular modules
import { Component, Input, OnInit, OnDestroy } from '@angular/core';

// rxjs
import { Subscription } from 'rxjs';

// ngrx
import { Store } from '@ngrx/store';

// our interfaces
import { INewBus } from '../../../../../../../shared-module/interfaces/petals.interface';
import { IStore } from '../../../../../../../shared-module/interfaces/store.interface';
import { IWorkspaceRecord, IWorkspace } from '../../../../../../../shared-module/interfaces/workspace.interface';
import {
  IMinimalWorkspaces,
  IMinimalWorkspacesRecord
} from '../../../../../../../shared-module/interfaces/minimal-workspaces.interface';

// our actions
import { IMPORT_BUS } from '../../../../../../../shared-module/reducers/workspace.reducer';

@Component({
  selector: 'app-petals-bus-import',
  templateUrl: './petals-bus-import.component.html',
  styleUrls: ['./petals-bus-import.component.scss']
})
export class PetalsBusImportComponent implements OnInit, OnDestroy {
  @Input() importing = false;
  @Input() newBus?: any;

  private workspace: IWorkspace;
  private workspaceSub: Subscription;

  private minimalWorkspaces: IMinimalWorkspaces;
  private minimalWorkspacesSub: Subscription;

  constructor(private store$: Store<IStore>) {
    this.minimalWorkspacesSub =
      store$.select('minimalWorkspaces')
        .map((minimalWorkspacesR: IMinimalWorkspacesRecord) => minimalWorkspacesR.toJS())
        .subscribe((minimalWorkspaces: IMinimalWorkspaces) => this.minimalWorkspaces = minimalWorkspaces);


    this.workspaceSub =
      store$.select('workspace')
        .map((workspaceR: IWorkspaceRecord) => workspaceR.toJS())
        .subscribe((workspace: IWorkspace) => this.workspace = workspace);
  }

  ngOnDestroy() {
    this.minimalWorkspacesSub.unsubscribe();
    this.workspaceSub.unsubscribe();
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
    this.store$.dispatch({ type: IMPORT_BUS, payload: newBus });
  }
}
