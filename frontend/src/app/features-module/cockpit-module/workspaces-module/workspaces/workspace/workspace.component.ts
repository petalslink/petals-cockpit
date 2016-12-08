/**
 * Copyright (C) 2016 Linagora
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

// angular modules
import { Component, OnDestroy } from '@angular/core';

// nrgx
import { Store } from '@ngrx/store';

// rxjs
import { Subscription } from 'rxjs';

// our interfaces
import { IStore } from './../../../../../shared-module/interfaces/store.interface';
import { IWorkspace, IWorkspaceRecord } from './../../../../../shared-module/interfaces/workspace.interface';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss']
})
export class WorkspaceComponent implements OnDestroy {
  public workspace: IWorkspace;
  private workspaceSub: Subscription;

  constructor(private store$: Store<IStore>) {
    this.workspaceSub =
      store$.select('workspace')
      .map((workspaceR: IWorkspaceRecord) => workspaceR.toJS())
      .subscribe((workspace: IWorkspace) => this.workspace = workspace);
  }

  ngOnDestroy() {
    this.workspaceSub.unsubscribe();
  }
}
