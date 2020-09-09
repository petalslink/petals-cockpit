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

import { IComponentRow } from '@feat/cockpit/workspaces/state/components/components.interface';
import { SharedLibraries } from '@feat/cockpit/workspaces/state/shared-libraries/shared-libraries.actions';
import { getCurrentUserPermissions } from '@feat/cockpit/workspaces/state/workspaces/workspaces.selectors';
import { stateToLedColor } from '@shared/helpers/shared.helper';
import { EComponentState } from '@shared/services/components.service';
import { ESharedLibraryState } from '@shared/services/shared-libraries.service';
import { IStore } from '@shared/state/store.interface';
import {
  getCurrentSharedLibrary,
  ISharedLibraryWithComponents,
} from '@wks/state/shared-libraries/shared-libraries.selectors';
import { filter, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-petals-shared-library-view',
  templateUrl: './petals-shared-library-view.component.html',
  styleUrls: ['./petals-shared-library-view.component.scss'],
})
export class PetalsSharedLibraryViewComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  sharedLibrary$: Observable<ISharedLibraryWithComponents>;
  workspaceId$: Observable<string>;

  isDeleted = false;
  hasLifecycleArtifactPerm = false;

  constructor(private store$: Store<IStore>) {}

  ngOnInit() {
    this.store$
      .pipe(
        select(getCurrentUserPermissions),
        takeUntil(this.onDestroy$),
        filter(permission => !!permission),
        tap(permission => {
          this.hasLifecycleArtifactPerm = permission.lifecycleArtifact;
        })
      )
      .subscribe();

    this.sharedLibrary$ = this.store$.pipe(
      select(getCurrentSharedLibrary),
      takeUntil(this.onDestroy$),
      filter(sl => {
        this.isDeleted = sl === undefined;
        return !this.isDeleted;
      })
    );

    this.workspaceId$ = this.store$.pipe(
      select(state => state.workspaces.selectedWorkspaceId)
    );
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  trackByComponent(i: number, component: IComponentRow) {
    return component.id;
  }

  unload(slId: string) {
    this.store$.dispatch(
      new SharedLibraries.ChangeState({
        id: slId,
        state: ESharedLibraryState.Unloaded,
      })
    );
  }

  getLedColorFromState(state: EComponentState) {
    return stateToLedColor(state);
  }
}
