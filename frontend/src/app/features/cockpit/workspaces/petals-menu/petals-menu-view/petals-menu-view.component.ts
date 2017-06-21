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
import { FormGroup, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';

import { IStore } from '../../../../../shared/state/store.interface';
// tslint:disable-next-line:max-line-length
import {
  getCurrentTree,
  WorkspaceElement,
  WorkspaceElementType,
} from '../../../../cockpit/workspaces/state/workspaces/workspaces.selectors';

import { IBusesInProgress } from '../../state/buses-in-progress/buses-in-progress.interface';
import { getBusesInProgress } from '../../state/buses-in-progress/buses-in-progress.selectors';
import { IWorkspacesTable } from './../../state/workspaces/workspaces.interface';

import { TreeEvent } from 'app/features/cockpit/workspaces/petals-menu/material-tree/material-tree.component';
import { Buses } from 'app/features/cockpit/workspaces/state/buses/buses.actions';
import { Containers } from 'app/features/cockpit/workspaces/state/containers/containers.actions';
import { Components } from 'app/features/cockpit/workspaces/state/components/components.actions';
import { Workspaces } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.actions';
import { Ui } from 'app/shared/state/ui.actions';

@Component({
  selector: 'app-petals-menu-view',
  templateUrl: './petals-menu-view.component.html',
  styleUrls: ['./petals-menu-view.component.scss'],
})
export class PetalsMenuViewComponent implements OnInit {
  public searchForm: FormGroup;
  public workspaces$: Observable<IWorkspacesTable>;
  public tree$: Observable<WorkspaceElement[]>;
  public busesInProgress$: Observable<IBusesInProgress>;

  constructor(private fb: FormBuilder, private store$: Store<IStore>) {}

  ngOnInit() {
    this.workspaces$ = this.store$.select(state => state.workspaces);
    this.tree$ = this.store$.let(getCurrentTree());
    this.busesInProgress$ = this.store$.let(getBusesInProgress());
    this.formSearchPetals();

    this.searchForm.valueChanges
      .do(value => {
        this.search(value.search);
      })
      .subscribe();
  }

  formSearchPetals() {
    this.searchForm = this.fb.group({
      search: '',
    });
  }

  onTreeToggleFold(e: TreeEvent<WorkspaceElement>) {
    switch (e.item.type) {
      case WorkspaceElementType.BUS:
        this.store$.dispatch(new Buses.ToggleFold({ id: e.item.id }));
        break;
      case WorkspaceElementType.CONTAINER:
        this.store$.dispatch(new Containers.ToggleFold({ id: e.item.id }));
        break;
      case WorkspaceElementType.COMPONENT:
        this.store$.dispatch(new Components.ToggleFold({ id: e.item.id }));
    }
  }

  onTreeSelect(_: TreeEvent<WorkspaceElement>) {
    // TODO: Dispatch an action to save the current bus/container/component/su
    // Instead of dispatching it from here maybe it's a better idea to dispatch it once the
    // component is loaded
    this.closeSidenavOnSmallScreen();
  }

  search(search: string) {
    this.store$.dispatch(new Workspaces.SetSearch({ search }));
  }

  closeSidenavOnSmallScreen() {
    this.store$.dispatch(new Ui.CloseSidenavOnSmallScreen());
  }
}
