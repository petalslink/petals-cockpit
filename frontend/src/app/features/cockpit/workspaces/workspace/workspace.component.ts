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

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

import { Workspaces } from '../state/workspaces/workspaces.reducer';
import { Ui } from '../../../../shared/state/ui.reducer';
import { IStore } from '../../../../shared/interfaces/store.interface';
import { IWorkspace } from './../state/workspaces/workspace.interface';
import { getCurrentWorkspace } from '../../../cockpit/workspaces/state/workspaces/workspaces.selectors';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss']
})
export class WorkspaceComponent implements OnInit {
  private workspaceIdSub: Subscription;
  public workspace$: Observable<IWorkspace>;

  constructor(
    private _store$: Store<IStore>,
    private _route: ActivatedRoute
  ) { }

  ngOnInit() {
    this._store$.dispatch({ type: Ui.SET_TITLES, payload: { titleMainPart1: 'Petals', titleMainPart2: '' } });

    this.workspace$ = this._store$.let(getCurrentWorkspace());
  }
}
