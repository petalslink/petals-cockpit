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
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';

import { ICurrentUser, IUser } from '@shared/state/users.interface';
import {
  IWorkspace,
  IWorkspaces,
} from '@wks/state/workspaces/workspaces.interface';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-workspaces-list',
  templateUrl: './workspaces-list.component.html',
  styleUrls: ['./workspaces-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspacesListComponent implements OnInit, OnDestroy {
  onDestroy$ = new Subject<void>();

  private _workspaces: IWorkspaces;
  @Input() user: ICurrentUser;
  @Output() evtFetch = new EventEmitter<IWorkspace>();

  constructor() {}

  @Input()
  set workspaces(workspaces: IWorkspaces) {
    this._workspaces = workspaces;
  }

  get workspaces() {
    return this._workspaces;
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  select(workspace: IWorkspace) {
    this.evtFetch.emit(workspace);
  }

  getUsersNames(users: IUser[]) {
    return users
      .map(user => user.name)
      .join(', ')
      .concat('.');
  }

  trackByWorkspace(i: number, workspace: IWorkspace) {
    return workspace.id;
  }
}
