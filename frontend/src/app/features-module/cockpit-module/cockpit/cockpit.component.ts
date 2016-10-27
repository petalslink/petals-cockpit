// angular modules
import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

// rxjs
import { Subscription } from 'rxjs';

// ngrx - store
import { Store } from '@ngrx/store';

// our actions
import { USR_IS_DISCONNECTING } from '../../../shared-module/reducers/user.reducer';

// our interfaces
import { IStore } from '../../../shared-module/interfaces/store.interface';
import { IConfig, IConfigRecord } from '../../../shared-module/interfaces/config.interface';
import { IUserRecord, IUser } from '../../../shared-module/interfaces/user.interface';
import {
  IMinimalWorkspacesRecord,
  IMinimalWorkspaces
} from '../../../shared-module/interfaces/minimal-workspaces.interface';
import { IWorkspaceRecord, IWorkspace } from '../../../shared-module/interfaces/workspace.interface';

// our actions
import { FETCH_WORKSPACES } from '../../../shared-module/reducers/minimal-workspaces.reducer';
import { FETCH_WORKSPACE } from '../../../shared-module/reducers/workspace.reducer';

interface ITabs extends Array<{ title: string, url: string }> {};

const tabs = [{
    title: 'Petals',
    url: 'petals'
  }, {
    title: 'Service',
    url: 'service'
  }, {
    title: 'API',
    url: 'api'
}];

@Component({
  selector: 'app-petals-cockpit',
  templateUrl: 'cockpit.component.html',
  styleUrls: ['cockpit.component.scss']
})
export class CockpitComponent implements OnInit, OnDestroy {
  private config: IConfig;
  private configSubscription: Subscription;
  private user: IUser;
  private userSubscription: Subscription;
  private minimalWorkspaces: IMinimalWorkspaces;
  private minimalWorkspacesSubscription: Subscription;
  private workspace: IWorkspace;
  private workspaceSubscription: Subscription;

  private tabSelectedIndex: number = -1;
  private tabs: ITabs;

  constructor(
    private store$: Store<IStore>,
    private router: Router,
    private route: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.configSubscription =
      store$.select('config')
        .map((configR: IConfigRecord) => configR.toJS())
        .subscribe((config: IConfig) => this.config = config);

    this.userSubscription =
      store$.select('user')
        .map((userR: IUserRecord) => userR.toJS())
        .subscribe((user: IUser) => this.user = user);

    this.minimalWorkspacesSubscription =
      store$.select('minimalWorkspaces')
        .map((minimalWorkspacesR: IMinimalWorkspacesRecord) => minimalWorkspacesR.toJS())
        .subscribe((minimalWorkspaces: IMinimalWorkspaces) => this.minimalWorkspaces = minimalWorkspaces);

    this.workspaceSubscription =
      store$.select('workspace')
        .map((workspaceR: IWorkspaceRecord) => workspaceR.toJS())
        .subscribe((workspace: IWorkspace) => this.workspace = workspace);

    this.tabs = tabs;
  }

  ngOnDestroy() {
    this.configSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
    this.minimalWorkspacesSubscription.unsubscribe();
    this.workspaceSubscription.unsubscribe();
  }

  ngOnInit() {
    this.store$.dispatch({ type: FETCH_WORKSPACES });

    this.route.firstChild.firstChild.params.map(params => params['idWorkspace'])
      .filter(idWorkspace => typeof idWorkspace !== 'undefined')
      // take(1) because cockpitComponent is loaded once by the app
      // and we won't change workspace without passing through workspacesComponent
      // (which trigger a CHANGE_WORKSPACE too)
      // this avoid to call change workspace twice in some cases
      .take(1)
      .map((idWorkspace: string) => {
        this.store$.dispatch({ type: FETCH_WORKSPACE, payload: idWorkspace });
      }).subscribe();

    const rePetals = /\/cockpit\/workspaces\/[0-9a-zA-Z-_]+\/petals/;
    const reService = /\/cockpit\/workspaces\/[0-9a-zA-Z-_]+\/service/;
    const reApi = /\/cockpit\/workspaces\/[0-9a-zA-Z-_]+\/api/;

    this.router.events
      // .throttle(val => Observable.interval(500))
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
    this.router.navigate(['./', this.workspace.id, this.tabs[index].url], { relativeTo: this.route.firstChild });
  }

  disconnectUser() {
    this.store$.dispatch({ type: USR_IS_DISCONNECTING });
  }
}
