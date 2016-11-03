// angular module
import { Component, OnDestroy } from '@angular/core';

// rxjs
import { Subscription } from 'rxjs';

// ngrx - store
import { Store } from '@ngrx/store';

// our interfaces
import { IStore } from '../../../../shared-module/interfaces/store.interface';
import {
  IMinimalWorkspaces,
  IMinimalWorkspacesRecord
} from '../../../../shared-module/interfaces/minimal-workspaces.interface';

// our actions
import { FETCH_WORKSPACE } from '../../../../shared-module/reducers/workspace.reducer';
import { ADD_WORKSPACE } from '../../../../shared-module/reducers/minimal-workspaces.reducer';

// import
@Component({
  selector: 'app-workspaces',
  templateUrl: 'workspaces.component.html',
  styleUrls: ['workspaces.component.scss']
})
export class WorkspacesComponent implements OnDestroy {
  private minimalWorkspaces: IMinimalWorkspaces;
  private minimalWorkspacesSub: Subscription;

  private name: string;

  constructor(
    private store$: Store<IStore>
  ) {
    this.minimalWorkspacesSub =
      store$.select('minimalWorkspaces')
      .map((minimalWorkspacesR: IMinimalWorkspacesRecord) => minimalWorkspacesR.toJS())
      .subscribe((minimalWorkspaces: IMinimalWorkspaces) => this.minimalWorkspaces = minimalWorkspaces);

    // TODO: find a way to let the workspace's name if error
    // when the addingWorkspace value from store is toggled, clean workspace's name
    store$.select('minimalWorkspaces')
      .map((minimalWorkspacesR: IMinimalWorkspacesRecord) => minimalWorkspacesR.get('addingWorkspace'))
      .distinctUntilChanged()
      .filter((addingWorkspace: boolean) => !addingWorkspace)
      .subscribe(() => {
        this.name = '';
      });
  }

  ngOnDestroy() {
    this.minimalWorkspacesSub.unsubscribe();
  }

  selectWorkspace(workspaceId: string) {
    this.store$.dispatch({ type: FETCH_WORKSPACE, payload: workspaceId });
  }

  addWorkspace(name: string) {
    this.store$.dispatch({ type: ADD_WORKSPACE, payload: name });
  }
}
