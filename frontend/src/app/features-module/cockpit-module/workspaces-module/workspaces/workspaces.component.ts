// angular module
import { Component, OnDestroy } from '@angular/core';

// rxjs
import {Subscription} from 'rxjs';

// ngrx - store
import { Store } from '@ngrx/store';

// our interfaces
import {IStore} from '../../../../shared-module/interfaces/store.interface';
import {
  IMinimalWorkspaces,
  IMinimalWorkspacesRecord
} from '../../../../shared-module/interfaces/minimal-workspaces.interface';

// our actions
import {FETCH_WORKSPACE} from '../../../../shared-module/reducers/workspace.reducer';

// import
@Component({
  selector: 'app-workspaces',
  templateUrl: 'workspaces.component.html',
  styleUrls: ['workspaces.component.scss']
})
export class WorkspacesComponent implements OnDestroy {
  private minimalWorkspaces: IMinimalWorkspaces;
  private minimalWorkspacesSubscription: Subscription;

  constructor(
    private store$: Store<IStore>
  ) {
    this.minimalWorkspacesSubscription =
      store$.select('minimalWorkspaces')
      .map((minimalWorkspacesR: IMinimalWorkspacesRecord) => minimalWorkspacesR.toJS())
      .subscribe((minimalWorkspaces: IMinimalWorkspaces) => this.minimalWorkspaces = minimalWorkspaces);
  }

  ngOnDestroy() {
    this.minimalWorkspacesSubscription.unsubscribe();
  }

  selectWorkspace(workspaceId: string) {
    this.store$.dispatch({ type: FETCH_WORKSPACE, payload: workspaceId });
  }
}
