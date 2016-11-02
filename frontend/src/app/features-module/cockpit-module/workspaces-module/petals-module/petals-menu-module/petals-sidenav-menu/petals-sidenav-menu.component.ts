// angular modules
import { Component, OnDestroy } from '@angular/core';

// rxjs
import { Subscription } from 'rxjs';

// ngrx
import { Store } from '@ngrx/store';

// our interfaces
import { IStore } from '../../../../../../shared-module/interfaces/store.interface';
import { IWorkspaceRecord, IWorkspace } from '../../../../../../shared-module/interfaces/workspace.interface';

// our actions
import { EDIT_PETALS_SEARCH, getSearchedWorkspace } from '../../../../../../shared-module/reducers/workspace.reducer';

@Component({
  selector: 'app-petals-sidenav-menu',
  templateUrl: 'petals-sidenav-menu.component.html',
  styleUrls: ['petals-sidenav-menu.component.scss']
})
export class PetalsSidenavMenuComponent implements OnDestroy {
  private workspace: IWorkspace;
  private workspaceSub: Subscription;

  constructor(private store$: Store<IStore>) {
    this.workspaceSub =
      store$.let(getSearchedWorkspace())
        .map((workspaceR: IWorkspaceRecord) => workspaceR.toJS())
        .subscribe((workspace: IWorkspace) => this.workspace = workspace);
  }

  ngOnDestroy() {
    this.workspaceSub.unsubscribe();
  }

  search(textSearch) {
    this.store$.dispatch({ type: EDIT_PETALS_SEARCH, payload: textSearch });
  }
}
