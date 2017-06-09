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

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TooltipPosition } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';

import { Workspaces } from '../workspaces/state/workspaces/workspaces.reducer';
import { IStore } from '../../../shared/interfaces/store.interface';
import { getWorkspacesList } from '../workspaces/state/workspaces/workspaces.selectors';
import {
  IWorkspaces,
  IWorkspace,
} from '../workspaces/state/workspaces/workspaces.interface';
import { Ui } from './../../../shared/state/ui.reducer';
import {
  IUser,
  ICurrentUser,
} from './../../../shared/interfaces/users.interface';
import { getCurrentUser } from './../../../shared/state/users.selectors';

@Component({
  selector: 'app-workspaces-dialog',
  templateUrl: './workspaces-dialog.component.html',
  styleUrls: ['./workspaces-dialog.component.scss'],
})
export class WorkspacesDialogComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  public workspaces$: Observable<IWorkspaces>;
  public newWksForm: FormGroup;
  public btnSubmitDisabled = true;
  public position: TooltipPosition = 'below';
  public showDelay = 0;
  public hideDelay = 600;
  public user: ICurrentUser;
  public user$: Observable<ICurrentUser>;

  constructor(
    private store$: Store<IStore>,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.workspaces$ = this.store$.let(getWorkspacesList());
    this.user$ = this.store$.let(getCurrentUser()).do(u => {
      this.user = u;
    });

    this.newWksForm = this.fb.group({
      name: [''],
    });

    this.store$
      .select(state => state.workspaces.isAddingWorkspace)
      .combineLatest(
        Observable.empty().concat(
          this.newWksForm.valueChanges
            .map(values => values.name)
            .distinctUntilChanged()
        )
      )
      .takeUntil(this.onDestroy$)
      .do(([isAddingWorkspace, name]) => {
        if (!name || isAddingWorkspace) {
          this.btnSubmitDisabled = true;
        } else {
          this.btnSubmitDisabled = false;
        }

        if (isAddingWorkspace) {
          this.newWksForm.disable();
        } else {
          this.newWksForm.enable();
        }
      })
      .subscribe();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  fetchWorkspace(workspace: IWorkspace) {
    this.store$
      .select(state => state.workspaces.selectedWorkspaceId)
      .first()
      .do(wsId => {
        // if no workspace is open, it will simply navigate to the required one
        if (wsId === workspace.id) {
          this.store$.dispatch({ type: Ui.CLOSE_POPUP_WORKSPACES_LIST });
        } else {
          this.router.navigate(['/workspaces', workspace.id]);
        }
      })
      .subscribe();
  }

  onSubmit({ value }) {
    this.store$.dispatch({
      type: Workspaces.POST_WORKSPACE,
      payload: value.name,
    });
    this.newWksForm.reset();
  }

  getUsersNames(users: Array<IUser>) {
    return users
      .filter(u => u.id !== this.user.id)
      .map(user => user.name)
      .join(', ');
  }
}
