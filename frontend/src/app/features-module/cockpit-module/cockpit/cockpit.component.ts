/**
 * Copyright (C) 2016 Linagora
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// angular modules
import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';

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
import {
  FETCH_WORKSPACE,
  SET_ID_BUS_CONTAINER_COMPONENT_SERVICE_UNIT
} from '../../../shared-module/reducers/workspace.reducer';

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
  private configSub: Subscription;
  private user: IUser;
  private userSub: Subscription;
  private minimalWorkspaces: IMinimalWorkspaces;
  private minimalWorkspacesSub: Subscription;
  private workspace: IWorkspace;
  private workspaceSub: Subscription;

  private tabSelectedIndex: number = -1;
  private tabs: ITabs;

  constructor(
    private store$: Store<IStore>,
    private router: Router,
    private route: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.configSub =
      store$.select('config')
        .map((configR: IConfigRecord) => configR.toJS())
        .subscribe((config: IConfig) => this.config = config);

    this.userSub =
      store$.select('user')
        .map((userR: IUserRecord) => userR.toJS())
        .subscribe((user: IUser) => this.user = user);

    this.minimalWorkspacesSub =
      store$.select('minimalWorkspaces')
        .map((minimalWorkspacesR: IMinimalWorkspacesRecord) => minimalWorkspacesR.toJS())
        .subscribe((minimalWorkspaces: IMinimalWorkspaces) => this.minimalWorkspaces = minimalWorkspaces);

    this.workspaceSub =
      store$.select('workspace')
        .map((workspaceR: IWorkspaceRecord) => workspaceR.toJS())
        .subscribe((workspace: IWorkspace) => this.workspace = workspace);

    this.tabs = tabs;
  }

  ngOnDestroy() {
    this.configSub.unsubscribe();
    this.userSub.unsubscribe();
    this.minimalWorkspacesSub.unsubscribe();
    this.workspaceSub.unsubscribe();
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

    /* tslint:disable:max-line-length */
    const rePetalsBusContCompSu = /\/cockpit\/workspaces\/[0-9a-zA-Z-_]+\/petals(?:\/bus\/([0-9a-zA-Z-_]+)(?:\/container\/([0-9a-zA-Z-_]+)(?:\/component\/([0-9a-zA-Z-_]+)(?:\/serviceUnit\/([0-9a-zA-Z-_]+))?)?)?)?/;
    /* tslint:enable:max-line-length */

    this.router.events
      .filter(event => event instanceof NavigationEnd)
      .subscribe((eventUrl: any) => {
        const url = eventUrl.urlAfterRedirects;

        // check selected tab
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

        // check selected bus/container/component/su
        let reRslt = rePetalsBusContCompSu.exec(url);

        this.store$.dispatch({
            type: SET_ID_BUS_CONTAINER_COMPONENT_SERVICE_UNIT,
            payload: {
              selectedBusId: (reRslt !== null && typeof reRslt[1] !== 'undefined' ? reRslt[1] : null),
              selectedContainerId: (reRslt !== null && typeof reRslt[2] !== 'undefined' ? reRslt[2] : null),
              selectedComponentId: (reRslt !== null && typeof reRslt[3] !== 'undefined' ? reRslt[3] : null),
              selectedServiceUnitId: (reRslt !== null && typeof reRslt[4] !== 'undefined' ? reRslt[4] : null)
            }
        });

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
