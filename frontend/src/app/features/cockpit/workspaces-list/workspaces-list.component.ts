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

import {
  Component,
  OnInit,
  OnDestroy,
  EventEmitter,
  Output,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Store } from '@ngrx/store';

import { IStore } from 'app/shared/state/store.interface';

import {
  IWorkspaces,
  IWorkspace,
} from 'app/features/cockpit/workspaces/state/workspaces/workspaces.interface';
import { IUser, ICurrentUser } from 'app/shared/state/users.interface';

import { Workspaces } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.actions';

@Component({
  selector: 'app-workspaces-list',
  templateUrl: 'workspaces-list.component.html',
  styleUrls: ['workspaces-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspacesListComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  @Input() workspaces: IWorkspaces;
  @Input() user: ICurrentUser;
  @Output() fetch = new EventEmitter<IWorkspace>();

  newWksForm: FormGroup;
  btnSubmitDisabled = true;

  constructor(private store$: Store<IStore>, private fb: FormBuilder) {}

  ngOnInit() {
    this.newWksForm = this.fb.group({
      name: [''],
    });

    this.store$
      .select(state => state.workspaces.isAddingWorkspace)
      .do(isAddingWorkspace => {
        if (isAddingWorkspace) {
          this.newWksForm.disable();
        } else {
          this.newWksForm.enable();
        }
      })
      .combineLatest(
        Observable.empty().concat(
          this.newWksForm.valueChanges
            .map(values => values.name)
            .distinctUntilChanged()
        )
      )
      .do(([isAddingWorkspace, name]) => {
        if (!name || isAddingWorkspace) {
          this.btnSubmitDisabled = true;
        } else {
          this.btnSubmitDisabled = false;
        }
      })
      .takeUntil(this.onDestroy$)
      .subscribe();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  select(workspace: IWorkspace) {
    this.fetch.emit(workspace);
  }

  onSubmit({ value }) {
    this.store$.dispatch(new Workspaces.Post({ name: value.name }));
    this.newWksForm.reset();
  }

  getUsersNames(users: Array<IUser>) {
    return users
      .filter(u => u.id !== this.user.id)
      .map(user => user.name)
      .join(', ');
  }
}
