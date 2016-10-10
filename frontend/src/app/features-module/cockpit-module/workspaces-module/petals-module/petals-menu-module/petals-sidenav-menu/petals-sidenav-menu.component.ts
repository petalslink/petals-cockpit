// angular modules
import { Component, ChangeDetectionStrategy } from '@angular/core';

// rxjs
import { Observable } from 'rxjs/Observable';

// ngrx
import { Store } from '@ngrx/store';

// our states
import { AppState } from '../../../../../../app.state';
import { WorkspacesState, WorkspacesStateRecord } from '../../../../../../shared-module/reducers/workspaces.state';

// our selectors
import { getSearchedWorkspace } from '../../../../../../shared-module/reducers/workspaces.reducer';

// our actions
import { EDIT_PETALS_SEARCH } from '../../../../../../shared-module/reducers/workspaces.reducer';

@Component({
  selector: 'app-petals-sidenav-menu',
  templateUrl: 'petals-sidenav-menu.component.html',
  styleUrls: ['petals-sidenav-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PetalsSidenavMenuComponent {
  private workspaces$: Observable<WorkspacesState>;

  constructor(private store: Store<AppState>) {
    this.workspaces$ = store.let(getSearchedWorkspace()).map((workspaces: WorkspacesStateRecord) => workspaces.toJS());
  }

  search(textSearch) {
    this.store.dispatch({ type: EDIT_PETALS_SEARCH, payload: textSearch });
  }
}
