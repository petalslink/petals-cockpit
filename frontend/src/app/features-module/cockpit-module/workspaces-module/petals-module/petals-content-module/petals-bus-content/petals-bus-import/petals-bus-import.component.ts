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
import { Component, Input, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';

// rxjs
import { Subscription } from 'rxjs';

// ngrx
import { Store } from '@ngrx/store';

// our interfaces
import { INewBus } from '../../../../../../../shared-module/interfaces/petals.interface';
import { IStore } from '../../../../../../../shared-module/interfaces/store.interface';
import { IWorkspaceRecord, IWorkspace } from '../../../../../../../shared-module/interfaces/workspace.interface';
import {
  IMinimalWorkspaces,
  IMinimalWorkspacesRecord
} from '../../../../../../../shared-module/interfaces/minimal-workspaces.interface';

// our actions
import { WorkspaceActions } from '../../../../../../../shared-module/reducers/workspace.actions';

import { MdInput } from '@angular/material';

@Component({
  selector: 'app-petals-bus-import',
  templateUrl: './petals-bus-import.component.html',
  styleUrls: ['./petals-bus-import.component.scss']
})
export class PetalsBusImportComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() importing = false;
  @Input() newBus?: any;
  @ViewChild('ipInput') ipInput: MdInput;

  private workspace: IWorkspace;
  private workspaceSub: Subscription;

  private minimalWorkspaces: IMinimalWorkspaces;
  private minimalWorkspacesSub: Subscription;

  constructor(private store$: Store<IStore>) {
    this.minimalWorkspacesSub =
      store$.select('minimalWorkspaces')
        .map((minimalWorkspacesR: IMinimalWorkspacesRecord) => minimalWorkspacesR.toJS())
        .subscribe((minimalWorkspaces: IMinimalWorkspaces) => this.minimalWorkspaces = minimalWorkspaces);


    this.workspaceSub =
      store$.select('workspace')
        .map((workspaceR: IWorkspaceRecord) => workspaceR.toJS())
        .subscribe((workspace: IWorkspace) => this.workspace = workspace);
  }

  ngOnDestroy() {
    this.minimalWorkspacesSub.unsubscribe();
    this.workspaceSub.unsubscribe();
  }

  ngOnInit() {
    if (typeof this.newBus === 'undefined' || typeof this.newBus.config === 'undefined') {
      this.newBus = {
        config: {
          ip: null,
          port: null,
          login: null,
          password: null
        }
      };
    }
  }

  ngAfterViewInit() {
    if (!this.importing) {
      this.ipInput.focus();
    }
  }

  importBus(newBus: INewBus) {
    this.store$.dispatch({ type: WorkspaceActions.IMPORT_BUS, payload: newBus });
  }

  removeBus(idBus: string) {
    this.store$.dispatch({ type: WorkspaceActions.REMOVE_BUS, payload: idBus });
  }
}
