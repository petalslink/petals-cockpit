/**
 * Copyright (C) 2017-2019 Linagora
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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { IStore } from '@shared/state/store.interface';

import {
  VisEdges,
  VisNetworkData,
  VisNetworkOptions,
  VisNetworkService,
  VisNodes,
} from 'ngx-vis';
import { fromEvent, Subject } from 'rxjs';
import { debounceTime, filter, map, takeUntil, tap } from 'rxjs/operators';

import {
  buildVisNetworkData,
  containerNetworkOptions,
} from './container-graph';

import { IContainerRow } from '@wks/state/containers/containers.interface';
import {
  componentsOfCurrentContainerByName,
  getCurrentContainer,
  IContainerWithSiblings,
  serviceAssembliesOfCurrentContainerByName,
  sharedLibrariesOfCurrentContainerByNameAndVersion,
} from '@wks/state/containers/containers.selectors';

class NetworkData implements VisNetworkData {
  public nodes: VisNodes;
  public edges: VisEdges;
}

@Component({
  selector: 'app-petals-container-view',
  templateUrl: './petals-container-view.component.html',
  styleUrls: ['./petals-container-view.component.scss'],
})
export class PetalsContainerViewComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  container$: Observable<IContainerWithSiblings>;
  componentsOfCurrentContainerByName$: Observable<{
    [name: string]: boolean;
  }>;
  sharedLibrariesOfCurrentContainerByNameAndVersion$: Observable<{
    [nameAndVersion: string]: boolean;
  }>;
  serviceAssembliesOfCurrentContainerByName$: Observable<{
    [name: string]: boolean;
  }>;

  container: IContainerWithSiblings;
  selectedContainer: IContainerRow;

  visNetwork = 'vis-network-container';
  visNetworkData: NetworkData;
  visNetworkOptions: VisNetworkOptions = containerNetworkOptions;

  constructor(
    private store$: Store<IStore>,
    private visNetworkService: VisNetworkService
  ) {}

  ngOnInit() {
    this.container$ = this.store$.pipe(select(getCurrentContainer));

    this.container$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(cont => {
          this.container = cont;
          if (cont && cont.reachabilities.length > 0) {
            this.visNetworkData = buildVisNetworkData(cont);
          }
        })
      )
      .subscribe();

    // because of https://github.com/seveves/ng2-vis/issues/36
    fromEvent(window, 'resize')
      .pipe(
        takeUntil(this.onDestroy$),
        debounceTime(500),
        map(_ => (this.visNetworkService as any).networks[this.visNetwork]),
        filter(net => !!net),
        tap(net => {
          const sizeChanged = net.setSize();
          if (sizeChanged) {
            net.redraw();
          }
        })
      )
      .subscribe();

    this.componentsOfCurrentContainerByName$ = this.store$.pipe(
      select(componentsOfCurrentContainerByName)
    );
    this.sharedLibrariesOfCurrentContainerByNameAndVersion$ = this.store$.pipe(
      select(sharedLibrariesOfCurrentContainerByNameAndVersion)
    );
    this.serviceAssembliesOfCurrentContainerByName$ = this.store$.pipe(
      select(serviceAssembliesOfCurrentContainerByName)
    );
  }

  networkInitialized() {
    // associate the click to a chart element
    this.visNetworkService.on(this.visNetwork, 'click');

    this.visNetworkService.click
      .pipe(
        takeUntil(this.onDestroy$),
        map((eventData: any[]) => {
          if (eventData[0] === this.visNetwork) {
            const selectedContainerId = eventData[1].nodes[0];
            if (selectedContainerId) {
              this.selectedContainer = this.container.siblings.find(
                c => c.id === selectedContainerId
              );
            }
          }
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();

    this.visNetworkService.off(this.visNetwork, 'click');
  }
}
