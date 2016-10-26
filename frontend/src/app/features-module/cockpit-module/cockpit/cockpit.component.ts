// angular modules
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
import { FETCH_WORKSPACES } from '../../../shared-module/reducers/workspaces.reducer';

@Component({
  selector: 'app-petals-cockpit',
  templateUrl: 'cockpit.component.html',
  styleUrls: ['cockpit.component.scss']
})
export class CockpitComponent implements OnInit {
  private user$: Observable<UserState>;
  private config$: Observable<ConfigState>;
  private workspaces$: Observable<WorkspacesState>;
  private selectedWorkspaceId: number;
  private tabSelectedIndex: number = -1;
  private tabs: Array<{ title: string, url: string }>;

  constructor(
    private store: Store<AppState>,
    private router: Router,
    private route: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef
  ) {
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

  ngOnInit() {
    this.user$ = <Observable<UserState>>this.store.select('user');
    this.config$ = <Observable<ConfigState>>this.store.select('config');
    this.workspaces$ = <Observable<WorkspacesStateRecord>>this.store.select('workspaces');

    this.workspaces$.subscribe((workspaces: WorkspacesStateRecord) => {
      this.selectedWorkspaceId = workspaces.get('selectedWorkspaceId');
    });

    this.store.dispatch({ type: FETCH_WORKSPACES });

    this.route.firstChild.firstChild.params.map(params => params['idWorkspace'])
      .filter(idWorkspace => typeof idWorkspace !== 'undefined')
      // take(1) because cockpitComponent is loaded once by the app
      // and we won't change workspace without passing through workspacesComponent
      // (which trigger a CHANGE_WORKSPACE too)
      // this avoid to call change workspace twice in some cases
      .take(1)
      .map((idWorkspace: string) => {
        // this.store.dispatch({ type: CHANGE_WORKSPACE, payload: idWorkspace });
      }).subscribe();

      // .subscribe((idWorkspace: number) => {
      //   this.store.dispatch({ type: CHANGE_WORKSPACE, payload: idWorkspace });
      // });

    const rePetals = /\/cockpit\/workspaces\/[0-9a-zA-Z-_]+\/petals/;
    const reService = /\/cockpit\/workspaces\/[0-9a-zA-Z-_]+\/service/;
    const reApi = /\/cockpit\/workspaces\/[0-9a-zA-Z-_]+\/api/;

    this.router.events
      .throttle(val => Observable.interval(500))
      .subscribe((eventUrl: any) => {
        const url = eventUrl.urlAfterRedirects;

        if (typeof url === 'undefined') {
          this.tabSelectedIndex = 0;
        } else if (url.match(rePetals)) {
          this.tabSelectedIndex = 0;
        } else if (url.match(reService)) {
          this.tabSelectedIndex = 1;
        } else if (url.match(reApi)) {
          this.tabSelectedIndex = 2;
        } else {
          this.tabSelectedIndex = 0;
        }

        // as the component is set to OnPush
        this.changeDetectorRef.markForCheck();
      });
  }

  openTab(index) {
    this.router.navigate(['./', this.selectedWorkspaceId, this.tabs[index].url], { relativeTo: this.route.firstChild });
  }

  disconnectUser() {
    this.store.dispatch({ type: USR_IS_DISCONNECTING });
  }
}
