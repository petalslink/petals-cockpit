/**
 * Copyright (C) 2017-2020 Linagora
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

import { Observable, Subject } from 'rxjs';

import { IStore } from '@shared/state/store.interface';
import {
  getCurrentWorkspaceTree,
  WorkspaceElement,
} from '@wks/state/workspaces/workspaces.selectors';

@Component({
  selector: 'app-topology-view',
  templateUrl: './topology-view.component.html',
  styleUrls: ['./topology-view.component.scss'],
})
export class TopologyViewComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  workspaceId$: Observable<string>;
  tree$: Observable<WorkspaceElement[]>;

  constructor(private store$: Store<IStore>) {}

  ngOnInit() {
    this.workspaceId$ = this.store$.pipe(
      select(state => state.workspaces.selectedWorkspaceId)
    );

    this.tree$ = this.store$.pipe(select(getCurrentWorkspaceTree));
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
