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
  Input,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { IWorkspacesIdsNames } from '@feat/cockpit/workspaces/state/workspaces/workspaces.selectors';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MenuComponent implements OnInit {
  onDestroy$ = new Subject<void>();

  private _workspacesIdsNames: { list: IWorkspacesIdsNames[] };

  // 28 characters max > width size of menu panel
  @Input() maxLength = 28;
  @Input('workspacesIdsNames')
  set workspacesIdsNames(workspacesIdsNames: { list: IWorkspacesIdsNames[] }) {
    this._workspacesIdsNames = workspacesIdsNames;
  }

  get workspacesIdsNames() {
    return this._workspacesIdsNames;
  }

  constructor(private router: Router) {}

  ngOnInit() {}

  goToWorkspacesList() {
    this.router.navigate(['/workspaces'], { queryParams: { page: 'list' } });
  }

  goToCreateWorkspace() {
    this.router.navigate(['/workspaces'], { queryParams: { page: 'create' } });
  }
}
