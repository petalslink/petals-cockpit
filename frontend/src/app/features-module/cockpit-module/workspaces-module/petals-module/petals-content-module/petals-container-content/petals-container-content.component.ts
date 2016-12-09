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
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// rxjs
import { Subscription } from 'rxjs';

// ngrx
import { Store } from '@ngrx/store';

// our interfaces
import { IStore } from './../../../../../../shared-module/interfaces/store.interface';
import { IBus, IContainer } from './../../../../../../shared-module/interfaces/petals.interface';
import { IWorkspace, IWorkspaceRecord } from './../../../../../../shared-module/interfaces/workspace.interface';
import { IContainerRecord } from './../../../../../../shared-module/interfaces/petals.interface';

// our selectors
import { getCurrentContainer } from './../../../../../../shared-module/reducers/workspace.reducer';

// our actions
import { WorkspaceActions } from './../../../../../../shared-module/reducers/workspace.actions';

@Component({
  selector: 'app-petals-container-content',
  templateUrl: './petals-container-content.component.html',
  styleUrls: ['./petals-container-content.component.scss']
})
export class PetalsContainerContentComponent implements OnInit, OnDestroy {
  public workspace: IWorkspace;
  private workspaceSub: Subscription;

  public container: IContainer;
  private containerSub: Subscription;

  constructor(private route: ActivatedRoute, private store$: Store<IStore>) {
    this.workspaceSub =
      store$.select('workspace')
        .map((workspaceR: IWorkspaceRecord) => workspaceR.toJS())
        .subscribe((workspace: IWorkspace) => this.workspace = workspace);

    this.containerSub = store$
      .let(getCurrentContainer())
      .map((containerR: IContainerRecord) => containerR.toJS())
      .subscribe((container: IContainer) => {
        this.container = container;
      });
  }

  ngOnInit() {
    this.route.params.subscribe(param => {
      this.store$.dispatch({
        type: WorkspaceActions.FETCH_CONTAINER_DETAILS,
        payload: {
          idWorkspace: param['idWorkspace'],
          idBus: param['idBus'],
          idContainer:  param['idContainer']
        }
      });
    });
  }

  ngOnDestroy() {
    this.workspaceSub.unsubscribe();
    this.containerSub.unsubscribe();
  }

  getContainerById(idContainer: string) {
    let bus = this.workspace.buses.find((b: IBus) => b.id === this.workspace.selectedBusId);

    if (!bus) {
      return;
    }

    return bus.containers.find((cont: IContainer) => cont.id === idContainer);
  }
}
