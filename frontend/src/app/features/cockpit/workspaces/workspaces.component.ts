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

import { ActivatedRoute, Params, Router } from '@angular/router';
import { IStore } from '@shared/state/store.interface';
import { isLargeScreen } from '@shared/state/ui.selectors';
import { ICurrentUser } from '@shared/state/users.interface';
import { getCurrentUser } from '@shared/state/users.selectors';
import { first, map, takeUntil, tap } from 'rxjs/operators';
import { Workspaces } from './state/workspaces/workspaces.actions';
import {
  IWorkspace,
  IWorkspaces,
} from './state/workspaces/workspaces.interface';
import { getWorkspaces } from './state/workspaces/workspaces.selectors';

@Component({
  selector: 'app-workspaces',
  templateUrl: './workspaces.component.html',
  styleUrls: ['./workspaces.component.scss'],
})
export class WorkspacesComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  workspaces$: Observable<IWorkspaces>;
  user$: Observable<ICurrentUser>;

  isFetchingWorkspaces$: Observable<boolean>;
  isFetchingWorkspace$: Observable<boolean>;
  isLargeScreen$: Observable<boolean>;

  isFocusWksName = false;

  page: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private store$: Store<IStore>
  ) {}

  ngOnInit() {
    this.workspaces$ = this.store$.pipe(getWorkspaces);
    this.user$ = this.store$.pipe(getCurrentUser);

    this.route.queryParams
      .pipe(
        takeUntil(this.onDestroy$),
        map((params: Params) => {
          this.page = params['page'];
          switch (this.page) {
            case 'create':
              this.isFocusWksName = true;
              break;
            case 'list':
              this.fetchWorkspaces();
              break;
            default:
              this.fetchWorkspaces();
              break;
          }
        })
      )
      .subscribe();

    this.isFetchingWorkspaces$ = this.store$.pipe(
      select(state => state.workspaces.isFetchingWorkspaces)
    );

    this.isLargeScreen$ = this.store$.pipe(isLargeScreen);

    this.isFetchingWorkspace$ = this.store$.pipe(
      select(state => state.workspaces.isFetchingWorkspace),
      tap(isFetchingWorkspace => {
        if (
          (this.page === 'create' || this.page === 'list') &&
          isFetchingWorkspace
        ) {
          this.page = null;
        }
      })
    );
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();

    // the workspaces action clean is used to reinitialize the store when we are no longer in workspaces module
    this.store$.dispatch(new Workspaces.CleanWorkspaces());
  }

  goToCreateWorkspace() {
    this.router.navigate(['/workspaces'], {
      queryParams: { page: 'create' },
    });

    this.isFocusWksName = true;
  }

  goToWorkspacesList() {
    this.fetchWorkspaces();

    this.router.navigate(['/workspaces'], {
      queryParams: { page: 'list' },
    });
  }

  onFetch(selected: IWorkspace) {
    if (selected) {
      this.store$
        .pipe(
          select(state => state.workspaces.selectedWorkspaceId),
          first(),
          tap(_ => {
            this.router.navigate(['/workspaces', selected.id]);
          })
        )
        .subscribe();
    }
  }

  onCreate(value: { name: string; shortDescription: string }) {
    this.store$.dispatch(
      new Workspaces.Create({
        name: value.name,
        shortDescription: value.shortDescription,
      })
    );
  }

  private fetchWorkspaces() {
    this.store$.dispatch(new Workspaces.FetchAll());

    this.store$
      .pipe(
        select(state => !state.workspaces.selectedWorkspaceId),
        first(),
        tap(() => {
          setTimeout(() => {
            tap((selected: IWorkspace) => {
              this.onFetch(selected);
            });
          });
        })
      )
      .subscribe();
  }
}
