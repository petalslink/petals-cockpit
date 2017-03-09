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

import { IStore } from '../../../../../shared/interfaces/store.interface';
import { getCurrentTree } from '../../../../cockpit/workspaces/state/workspaces/workspaces.selectors';
import { Components } from '../../state/components/components.reducer';
import { Containers } from '../../state/containers/containers.reducer';
import { Buses } from '../../state/buses/buses.reducer';
import { IBusesInProgress } from '../../state/buses-in-progress/buses-in-progress.interface';
import { getBusesInProgress } from '../../state/buses-in-progress/buses-in-progress.selectors';
import { IWorkspacesTable } from './../../state/workspaces/workspaces.interface';
import { Workspaces } from './../../state/workspaces/workspaces.reducer';
import { Ui } from '../../../../../shared/state/ui.reducer';

@Component({
  selector: 'app-petals-menu-view',
  templateUrl: './petals-menu-view.component.html',
  styleUrls: ['./petals-menu-view.component.scss']
})
export class PetalsMenuViewComponent implements OnInit {
  public searchForm: FormGroup;
  public workspaces$: Observable<IWorkspacesTable>;
  public tree$: Observable<any>;
  public busesInProgress$: Observable<IBusesInProgress>;

  constructor(private fb: FormBuilder, private store$: Store<IStore>) { }

  ngOnInit() {
    this.workspaces$ = this.store$.select(state => state.workspaces);
    this.tree$ = this.store$.let(getCurrentTree());
    this.busesInProgress$ = this.store$.let(getBusesInProgress());
    this.formSearchPetals();

    this.searchForm.valueChanges.subscribe(value => {
      this.search(value.search);
    });
  }

  formSearchPetals() {
    this.searchForm = this.fb.group({
      search: ''
    });
  }

  onTreeToggleFold(e) {
    switch (e.item.typeId) {
      case 'busId':
        this.store$.dispatch({ type: Buses.TOGGLE_FOLD_BUS, payload: { busId: e.item.id } });
        break;
      case 'containerId':
        this.store$.dispatch({ type: Containers.TOGGLE_FOLD_CONTAINER, payload: { containerId: e.item.id } });
        break;
      case 'componentId':
        this.store$.dispatch({ type: Components.TOGGLE_FOLD_COMPONENT, payload: { componentId: e.item.id } });
    }
  }

  onTreeSelect() {
    // TODO: Dispatch an action to save the current bus/container/component/su
    // Instead of dispatching it from here maybe it's a better idea to dispatch it once the
    // component is loaded
    this.closeSidenavOnSmallScreen();
  }

  search(search: string) {
    this.store$.dispatch({ type: Workspaces.SET_SEARCH, payload: search });
  }

  closeSidenavOnSmallScreen() {
    this.store$.dispatch({ type: Ui.CLOSE_SIDENAV_ON_SMALL_SCREEN });
  }
}
