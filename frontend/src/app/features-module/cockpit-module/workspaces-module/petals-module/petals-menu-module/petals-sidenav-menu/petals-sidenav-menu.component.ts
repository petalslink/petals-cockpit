// angular modules
import { Component, OnInit } from '@angular/core';

// immutable
import { List } from 'immutable';

// rxjs
import { Observable } from 'rxjs/Observable';

// ngrx
import { Store } from '@ngrx/store';

// our states
import { AppState } from '../../../../../../app.state';
import { WorkspacesState, WorkspacesStateRecord } from '../../../../../../shared-module/reducers/workspaces.state';

// our interfaces
import { IBus } from '../../../../../../shared-module/interfaces/petals.interface';

// our selectors
import { getSearchedWorkspace } from '../../../../../../shared-module/reducers/workspaces.reducer';

// our actions
import { EDIT_PETALS_SEARCH } from '../../../../../../shared-module/reducers/workspaces.reducer';

@Component({
  selector: 'app-petals-sidenav-menu',
  templateUrl: 'petals-sidenav-menu.component.html',
  styleUrls: ['petals-sidenav-menu.component.scss']
})
export class PetalsSidenavMenuComponent implements OnInit {
  private workspaces$: Observable<WorkspacesState>;
  private workspaces: WorkspacesState;
  private buses: List<IBus>;
  private selectedWorkspaceId: string;

  constructor(private store: Store<AppState>) {
    this.workspaces$ = store.let(getSearchedWorkspace()).map((workspaces: WorkspacesStateRecord) => workspaces.toJS());
  }

  ngOnInit() {
    this.workspaces$.subscribe((workspaces: WorkspacesState) => {
      if (
        typeof workspaces.selectedWorkspaceId !== 'undefined' &&
        workspaces.selectedWorkspaceId !== null &&
        typeof workspaces.workspaces !== 'undefined' &&
        workspaces.workspaces !== null
      ) {
        this.workspaces = workspaces;
        this.selectedWorkspaceId = workspaces.selectedWorkspaceId;
        this.buses = workspaces.workspaces.find(w => w.id === workspaces.selectedWorkspaceId).buses;
      }
    });
  }

  search(textSearch) {
    this.store.dispatch({ type: EDIT_PETALS_SEARCH, payload: textSearch });
  }
}
