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
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';

import { Router } from '@angular/router';
import { IStore } from '@shared/state/store.interface';
import { Ui } from '@shared/state/ui.actions';
import { isLargeScreen } from '@shared/state/ui.selectors';
import { ICurrentUser } from '@shared/state/users.interface';
import { getCurrentUser } from '@shared/state/users.selectors';
import { first, tap } from 'rxjs/operators';
import { Workspaces } from './state/workspaces/workspaces.actions';
import {
  IWorkspace,
  IWorkspaces,
} from './state/workspaces/workspaces.interface';
import {
  getWorkspaces,
  getWorkspacesListOrCreateWks,
} from './state/workspaces/workspaces.selectors';

@Component({
  selector: 'app-workspaces',
  templateUrl: './workspaces.component.html',
  styleUrls: ['./workspaces.component.scss'],
})
export class WorkspacesComponent
  implements OnInit, OnDestroy, AfterViewChecked {
  private onDestroy$ = new Subject<void>();

  workspaces$: Observable<IWorkspaces>;
  user$: Observable<ICurrentUser>;

  workspacesVisible$: Observable<boolean>;
  isFetchingWorkspaces$: Observable<boolean>;
  isFetchingWorkspace$: Observable<boolean>;
  workspacesListVisible$: Observable<boolean>;
  createWorkspaceVisible$: Observable<boolean>;
  isLargeScreen$: Observable<boolean>;

  isFocusWksName = false;

  constructor(
    private router: Router,
    private store$: Store<IStore>,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.workspaces$ = this.store$.pipe(getWorkspaces);
    this.user$ = this.store$.pipe(getCurrentUser);

    this.workspacesVisible$ = this.store$.pipe(
      select(getWorkspacesListOrCreateWks),
      tap(isWorkspacesListOrCreateWksVisible => {
        if (isWorkspacesListOrCreateWksVisible) {
          this.fetchWorkspaces();
        }
      })
    );

    this.isFetchingWorkspaces$ = this.store$.pipe(
      select(state => state.workspaces.isFetchingWorkspaces)
    );

    this.workspacesListVisible$ = this.store$.pipe(
      select(state => state.ui.isWorkspacesListVisible)
    );

    this.createWorkspaceVisible$ = this.store$.pipe(
      select(state => state.ui.isCreateWorkspaceVisible)
    );

    this.isLargeScreen$ = this.store$.pipe(isLargeScreen);

    this.isFetchingWorkspace$ = this.store$.pipe(
      select(state => state.workspaces.isFetchingWorkspace)
    );
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngAfterViewChecked() {
    this.changeDetector.detectChanges();
  }

  openCreateWorkspace() {
    this.store$.dispatch(new Ui.OpenCreateWorkspace());
    this.isFocusWksName = true;
  }

  backToWorkspacesList() {
    this.store$.dispatch(new Ui.OpenWorkspacesList());
  }

  onFetch(selected: IWorkspace) {
    if (selected) {
      this.store$
        .pipe(
          select(state => state.workspaces.selectedWorkspaceId),
          first(),
          tap(_ => {
            // close workspaces view when selecting a workspace
            this.store$.dispatch(new Ui.CloseWorkspacesList());
            this.store$.dispatch(new Ui.CloseCreateWorkspace());
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

@Component({
  selector: 'app-no-workspace',
  template: '',
})
export class NoWorkspaceComponent implements OnInit {
  constructor(private store$: Store<IStore>) {}

  ngOnInit() {
    this.store$.dispatch(new Ui.OpenWorkspacesList());
  }
}
