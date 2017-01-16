import { Observable } from 'rxjs/Observable';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

import { Workspaces } from '../workspaces/state/workspaces/workspaces.reducer';
import { IStore } from '../../../shared/interfaces/store.interface';
import { getWorkspacesList } from '../workspaces/state/workspaces/workspaces.selectors';
import { IWorkspaces } from '../workspaces/state/workspaces/workspaces.interface';
import { IWorkspace } from '../workspaces/state/workspaces/workspace.interface';

@Component({
  selector: 'app-workspaces-dialog',
  templateUrl: './workspaces-dialog.component.html',
  styleUrls: ['./workspaces-dialog.component.scss']
})
export class WorkspacesDialogComponent implements OnInit {
  public workspaces$: Observable<IWorkspaces>;

  constructor(private _store$: Store<IStore>) { }

  ngOnInit() {
    this.workspaces$ = this._store$.let(getWorkspacesList());
  }

  // TODO use good type
  fetchWorkspace(workspace: IWorkspace) {
    this._store$.dispatch({ type: Workspaces.FETCH_WORKSPACE, payload: workspace.id });
  }
}
