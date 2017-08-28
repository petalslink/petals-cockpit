/**
 * Copyright (C) 2017 Linagora
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
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { IStore } from '../../../../../shared/state/store.interface';

import { SharedLibraries } from 'app/features/cockpit/workspaces/state/shared-libraries/shared-libraries.actions';
import {
  getCurrentSharedLibrary,
  ISharedLibraryWithComponents,
} from 'app/features/cockpit/workspaces/state/shared-libraries/shared-libraries.selectors';
import { deletable, IDeletable } from 'app/shared/operators/deletable.operator';
import { Ui } from 'app/shared/state/ui.actions';

@Component({
  selector: 'app-petals-shared-library-view',
  templateUrl: './petals-shared-library-view.component.html',
  styleUrls: ['./petals-shared-library-view.component.scss'],
})
export class PetalsSharedLibraryViewComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  sharedLibrary$: Observable<IDeletable<ISharedLibraryWithComponents>>;
  workspaceId$: Observable<string>;

  constructor(private store$: Store<IStore>, private route: ActivatedRoute) {}

  ngOnInit() {
    this.store$.dispatch(
      new Ui.SetTitles({
        titleMainPart1: 'Petals',
        titleMainPart2: 'Shared Library',
      })
    );

    this.route.paramMap
      .map(pm => pm.get('sharedLibraryId'))
      .takeUntil(this.onDestroy$)
      .do(id => {
        this.store$.dispatch(new SharedLibraries.SetCurrent({ id }));
        this.store$.dispatch(new SharedLibraries.FetchDetails({ id }));
      })
      .finally(() =>
        this.store$.dispatch(new SharedLibraries.SetCurrent({ id: '' }))
      )
      .subscribe();

    this.sharedLibrary$ = this.store$
      .let(getCurrentSharedLibrary)
      .let(deletable);

    this.workspaceId$ = this.store$.select(
      state => state.workspaces.selectedWorkspaceId
    );
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
