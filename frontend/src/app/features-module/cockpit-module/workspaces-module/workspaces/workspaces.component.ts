// angular module
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

// rxjs
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs';

// ngrx - store
import { Store } from '@ngrx/store';

// our states
import { AppState } from '../../../../app.state';
import { WorkspacesState } from '../../../../shared-module/reducers/workspaces.state';

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
  private selectedWorkspaceId: number;
  private routeParamsSubscription: Subscription;

  constructor(private store: Store<AppState>, private router: Router, private route: ActivatedRoute) {
    this.workspaces$ = <Observable<WorkspacesState>>store.select('workspaces');
  }

  selectWorkspace(workspaceId: number) {
    this.store.dispatch({ type: CHANGE_SELECTED_WORKSPACE, payload: workspaceId });
    this.router.navigate(['./', workspaceId], {relativeTo: this.route.parent});
  }

  ngOnInit(): void {
    this.workspaces$.subscribe(workspaces => {
      this.selectedWorkspaceId = workspaces.selectedWorkspaceId;
    });

    this.routeParamsSubscription = this.route.params
      .map(params => params['idWorkspace'])
      .subscribe((idWorkspace: number) => {
        this.store.dispatch({ type: CHANGE_SELECTED_WORKSPACE, payload: idWorkspace });
      });
  }

  ngOnDestroy() {
    this.routeParamsSubscription.unsubscribe();
  }
}
