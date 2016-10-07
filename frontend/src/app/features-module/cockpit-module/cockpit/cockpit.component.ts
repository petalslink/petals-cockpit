// angular modules
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

// rxjs
import { Observable } from 'rxjs';

// ngrx - store
import { Store } from '@ngrx/store';

// our states
import { AppState } from '../../../app.state';
import { ConfigState } from '../../../shared-module/reducers/config.state';
import { UserState } from '../../../shared-module/reducers/user.state';
import { WorkspacesState, WorkspacesStateRecord } from '../../../shared-module/reducers/workspaces.state';

// our actions
import { USR_IS_DISCONNECTING } from '../../../shared-module/reducers/user.reducer';
import { CHANGE_SELECTED_WORKSPACE } from '../../../shared-module/reducers/workspaces.reducer';

@Component({
  selector: 'app-petals-cockpit',
  templateUrl: 'cockpit.component.html',
  styleUrls: ['cockpit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CockpitComponent {
  private user$: Observable<UserState>;
  private config$: Observable<ConfigState>;
  private workspaces$: Observable<WorkspacesState>;
  private selectedWorkspaceId: number;

  private tabs: Array<{ title: string, url: string }>;

  constructor(private store: Store<AppState>, private router: Router, private route: ActivatedRoute) {
    this.user$ = <Observable<UserState>>store.select('user');
    this.config$ = <Observable<ConfigState>>store.select('config');
    this.workspaces$ = <Observable<WorkspacesStateRecord>>store.select('workspaces');

    this.workspaces$.subscribe((workspaces: WorkspacesStateRecord) => {
      this.selectedWorkspaceId = workspaces.toJS().selectedWorkspaceId;
    });

    this.route.firstChild.firstChild.params
      .map(params => params['idWorkspace'])
      .subscribe((idWorkspace: number) => {
        this.store.dispatch({ type: CHANGE_SELECTED_WORKSPACE, payload: idWorkspace });
      });

    this.tabs = [
      {
        title: 'Petals',
        url: 'petals'
      },
      {
        title: 'Service',
        url: 'service'
      },
      {
        title: 'API',
        url: 'api'
      }
    ];
  }

  openTab(index) {
    this.router.navigate(['./', this.selectedWorkspaceId, this.tabs[index].url], { relativeTo: this.route.firstChild });
  }

  disconnectUser() {
    this.store.dispatch({ type: USR_IS_DISCONNECTING });
  }
}
