// angular module
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

// immutable
import { List } from 'immutable';

// rxjs
import { Observable } from 'rxjs/Observable';

// ngrx - store
import { Store } from '@ngrx/store';

// our states
import { AppState } from '../../../../app.state';
import { WorkspacesState, WorkspacesStateRecord } from '../../../../shared-module/reducers/workspaces.state';

// our interfaces
import { IBus } from '../../../../shared-module/interfaces/petals.interface';

// our actions
import { CHANGE_SELECTED_WORKSPACE } from '../../../../shared-module/reducers/workspaces.reducer';

// import
@Component({
  selector: 'app-workspaces',
  templateUrl: 'workspaces.component.html',
  styleUrls: ['workspaces.component.scss']
})
export class WorkspacesComponent implements OnInit, OnDestroy {
  private workspaces$: Observable<WorkspacesState>;
  private buses: List<IBus>;
  private selectedWorkspaceId: string;

  constructor(
    private store: Store<AppState>,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.workspaces$ = <Observable<WorkspacesState>>store.select('workspaces')
      .map((workspaces: WorkspacesStateRecord) => workspaces.toJS());
  }

  selectWorkspace(workspaceId: string) {
    this.store.dispatch({ type: CHANGE_SELECTED_WORKSPACE, payload: workspaceId });
    this.router.navigate(['./', workspaceId], {relativeTo: this.route.parent});
  }

  ngOnInit(): void {
    this.workspaces$.subscribe(workspace => {
      this.selectedWorkspaceId = workspace.selectedWorkspaceId;

      if (
        typeof this.selectedWorkspaceId !== 'undefined' &&
        this.selectedWorkspaceId !== null &&
        typeof workspace.workspaces !== 'undefined' &&
        workspace.workspaces !== null
      ) {
        this.buses = workspace.workspaces.find(w => w.id === this.selectedWorkspaceId).buses;
      }
    });
  }

  ngOnDestroy() {
  }
}
