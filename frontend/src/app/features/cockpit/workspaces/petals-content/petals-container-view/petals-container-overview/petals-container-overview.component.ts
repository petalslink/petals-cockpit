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

import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Store } from '@ngrx/store';

import {
  VisEdges,
  VisNetworkData,
  VisNetworkOptions,
  VisNetworkService,
  VisNodes,
} from 'ngx-vis';
import { fromEvent, Observable, Subject } from 'rxjs';
import { debounceTime, filter, map, takeUntil, tap } from 'rxjs/operators';

import { IStore } from '@shared/state/store.interface';
import { isLargeScreen } from '@shared/state/ui.selectors';
import { IContainerRow } from '@wks/state/containers/containers.interface';
import { IContainerWithSiblings } from '@wks/state/containers/containers.selectors';
import {
  buildVisNetworkData,
  containerNetworkOptions,
} from './container-graph';

class NetworkData implements VisNetworkData {
  public nodes: VisNodes;
  public edges: VisEdges;
}

@Component({
  selector: 'app-petals-container-overview',
  templateUrl: './petals-container-overview.component.html',
  styleUrls: ['./petals-container-overview.component.scss'],
})
export class PetalsContainerOverviewComponent
  implements OnInit, OnDestroy, OnChanges {
  private onDestroy$ = new Subject<void>();
  public btnByScreenSize$: Observable<string>;

  @Input() container: IContainerWithSiblings;
  @Input() workspaceId: string;

  visNetwork = 'vis-network-container';
  visNetworkData: NetworkData;
  visNetworkOptions: VisNetworkOptions = containerNetworkOptions;
  selectedContainer: IContainerRow;

  constructor(
    private visNetworkService: VisNetworkService,
    private store$: Store<IStore>
  ) {}

  ngOnChanges(_changes: SimpleChanges) {
    if (this.container && this.container.reachabilities.length > 0) {
      this.visNetworkData = buildVisNetworkData(this.container);
    }
  }

  ngOnInit() {
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

    this.btnByScreenSize$ = this.store$.pipe(
      isLargeScreen,
      map(ls => (ls ? `mat-raised-button` : `mat-mini-fab`))
    );
  }

  networkInitialized() {
    this.visNetworkService.on(this.visNetwork, 'click');

    this.visNetworkService.click.subscribe((eventData: any[]) => {
      if (eventData[0] === this.visNetwork) {
        const selectedContainerId = eventData[1].nodes[0];
        if (selectedContainerId) {
          this.selectedContainer = this.container.siblings.find(
            c => c.id === selectedContainerId
          );
        }
      }
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();

    this.visNetworkService.off(this.visNetwork, 'click');
  }
}
