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
  EventEmitter,
  Output,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Observable } from 'rxjs/Observable';

import {
  IWorkspaces,
  IWorkspace,
} from 'app/features/cockpit/workspaces/state/workspaces/workspaces.interface';
import { IUser, ICurrentUser } from 'app/shared/state/users.interface';

@Component({
  selector: 'app-workspaces-list',
  templateUrl: 'workspaces-list.component.html',
  styleUrls: ['workspaces-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspacesListComponent implements OnInit {
  private _workspaces: IWorkspaces;
  @Input() user: ICurrentUser;
  @Output() fetch = new EventEmitter<IWorkspace>();
  @Output() create = new EventEmitter<string>();

  newWksForm: FormGroup;
  submitDisabled$: Observable<boolean>;

  constructor(private fb: FormBuilder) {}

  @Input()
  set workspaces(workspaces: IWorkspaces) {
    this._workspaces = workspaces;
    if (this.newWksForm) {
      if (workspaces.isAddingWorkspace) {
        this.newWksForm.disable();
      } else {
        this.newWksForm.enable();
      }
    }
  }

  get workspaces() {
    return this._workspaces;
  }

  ngOnInit() {
    this.newWksForm = this.fb.group({
      name: [''],
    });

    this.submitDisabled$ = this.newWksForm.valueChanges
      .map(values => values.name)
      .distinctUntilChanged()
      .map(name => !name || this.workspaces.isAddingWorkspace)
      .startWith(true);
  }

  select(workspace: IWorkspace) {
    this.fetch.emit(workspace);
  }

  onSubmit({ value }) {
    this.create.emit(value.name);
    this.newWksForm.reset();
  }

  getUsersNames(users: Array<IUser>) {
    return users
      .filter(u => u.id !== this.user.id)
      .map(user => user.name)
      .join(', ');
  }
}
