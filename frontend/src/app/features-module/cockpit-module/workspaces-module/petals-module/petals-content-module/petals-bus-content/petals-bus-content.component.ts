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
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

// rxjs
import { Subscription, Observable } from 'rxjs';

// ngrx
import { Store } from '@ngrx/store';

// our interfaces
import { IBus } from '../../../../../../shared-module/interfaces/petals.interface';
import { IStore } from '../../../../../../shared-module/interfaces/store.interface';
import { IWorkspace, IWorkspaceRecord } from '../../../../../../shared-module/interfaces/workspace.interface';

@Component({
  selector: 'app-petals-bus-content',
  templateUrl: './petals-bus-content.component.html',
  styleUrls: ['./petals-bus-content.component.scss']
})
export class PetalsBusContentComponent implements OnInit, OnDestroy {
  private workspace$: Observable<IWorkspaceRecord>;

  private workspace$WithBus: Observable<IWorkspaceRecord>;
  private workspace$WithBusSub: Subscription;

  public workspace: IWorkspace;
  private workspaceSub: Subscription;

  private routeSub: Subscription;

  public bus: IBus;
  public busInImport: boolean;

  constructor(private store$: Store<IStore>, private route: ActivatedRoute) {
    this.workspace$ = store$.select('workspace');

    this.workspaceSub = this.workspace$
        .map((workspaceR: IWorkspaceRecord) => workspaceR.toJS())
        .subscribe((workspace: IWorkspace) => this.workspace = workspace);
  }

  ngOnDestroy() {
    this.workspaceSub.unsubscribe();
    this.routeSub.unsubscribe();
    this.workspace$WithBusSub.unsubscribe();
  }

  ngOnInit() {
    // get the current workspace (once) only if
    // it has an array of buses OR buses in progress with at least one value
    this.workspace$WithBus = this.workspace$
      .filter((workspaceR: IWorkspaceRecord) => (workspaceR.get('buses').size + workspaceR.get('busesInProgress').size) > 0);

    // update the current bus IF
    // it's ID is in the URL AND the current workspace has at least one bus
    this.routeSub =
      this.route.params.combineLatest(this.workspace$WithBus.take(1),
        (params: Params) => {
          this.updateBus(params['idBus'], true);
        }).subscribe();

    this.workspace$WithBusSub =
      this.route.params.combineLatest(this.workspace$WithBus,
        (params: Params) => {
          this.updateBus(params['idBus'], false);
        }
      ).subscribe();
  }

  updateBus(idBus: string, reloadConfig: boolean) {
    // try to find the bus in buses in progress
    let busInProgressFiltered = this.workspace.busesInProgress.find((b: IBus) => b.id === idBus);

    // if importing bus
    if (busInProgressFiltered) {
      this.bus = busInProgressFiltered;
      this.busInImport = true;
    }

    else {
      this.bus = this.workspace.buses.find((b: IBus) => b.id === idBus);
      this.busInImport = false;
    }

    // reload if asked OR if bus status change from importing to imported
    // if (reloadConfig || busInImportPreviousStatus !== this.busInImport) {
    //   console.log(FETCH_BUS_CONFIG);
    //   this.store$.dispatch({ type: FETCH_BUS_CONFIG, payload: idBus });
    // }
  }
}
