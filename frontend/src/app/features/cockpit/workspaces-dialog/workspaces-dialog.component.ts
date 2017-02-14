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

import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TooltipPosition } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';

import { Workspaces } from '../workspaces/state/workspaces/workspaces.reducer';
import { IStore } from '../../../shared/interfaces/store.interface';
import { getWorkspacesList } from '../workspaces/state/workspaces/workspaces.selectors';
import { IWorkspaces } from '../workspaces/state/workspaces/workspaces.interface';
import { IWorkspace } from '../workspaces/state/workspaces/workspace.interface';
import { Ui } from './../../../shared/state/ui.reducer';
import { IUser } from './../../../shared/interfaces/user.interface';
import { IUsersTable } from './../../../shared/interfaces/users.interface';
import { getCurrentUser } from './../../../shared/state/users.selectors';

@Component({
  selector: 'app-workspaces-dialog',
  templateUrl: './workspaces-dialog.component.html',
  styleUrls: ['./workspaces-dialog.component.scss']
})
export class WorkspacesDialogComponent implements OnInit, OnDestroy {
  public workspaces$: Observable<IWorkspaces>;
  public newWksForm: FormGroup;
  public isAddingWorkspaceSub: Subscription;
  public btnSubmitDisabled = true;
  public position: TooltipPosition = 'below';
  public showDelay = 0;
  public hideDelay = 600;
  public user: IUser;
  private user$: Observable<IUser>;

  constructor(
    private _store$: Store<IStore>,
    private _router: Router,
    private _fb: FormBuilder) { }

  ngOnInit() {
    this.workspaces$ = this._store$.let(getWorkspacesList());
    this.user$ = this
      ._store$
      .let(getCurrentUser())
      .do(u => {
        this.user = u;
      });

    this.newWksForm = this._fb.group({
      name: ['', Validators.required]
    });

    this.isAddingWorkspaceSub = this
      ._store$
      .select(state => state.workspaces.isAddingWorkspace)
      .combineLatest(Observable
        .empty()
        .concat(this
          .newWksForm
          .valueChanges
          .map(values => values.name)
          .distinctUntilChanged()
        )
      )
      .do(([isAddingWorkspace, _]) => {
        if (this.newWksForm.invalid || isAddingWorkspace) {
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
    this.isAddingWorkspaceSub.unsubscribe();
  }

  // TODO use good type
  fetchWorkspace(workspace: IWorkspace) {
    this._store$
      .select(state => state.workspaces.selectedWorkspaceId)
      .first()
      .subscribe(wsId => {
        // if no workspace is open, it will simply navigate too
        if (wsId === workspace.id) {
          this._store$.dispatch({ type: Ui.CLOSE_POPUP_WORKSPACES_LIST });
        } else {
          this._router.navigate(['/workspaces', workspace.id]);
        }
      });
  }

  onSubmit({ value }) {
    this._store$.dispatch({ type: Workspaces.POST_WORKSPACE, payload: value.name });
  }

  getUsersNames(users: Array<IUser>) {
    return users
      .filter(u => this.user ? u.id !== this.user.id : true)
      .map(user => user.name)
      .join(', ');
  }
}
