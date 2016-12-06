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
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

// ngrx - store
import { Store } from '@ngrx/store';

// our interfaces
import { IStore } from '../../../../../../shared-module/interfaces/store.interface';
import { IBus } from '../../../../../../shared-module/interfaces/petals.interface';
import { IWorkspace } from '../../../../../../shared-module/interfaces/workspace.interface';

// our actions
import { WorkspaceActions } from './../../../../../../shared-module/reducers/workspace.actions';

@Component({
  selector: 'app-buses-menu',
  templateUrl: 'petals-buses-menu.component.html',
  styleUrls: ['petals-buses-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusesMenuComponent {
  @Input() workspace: IWorkspace;
  @Input() buses: Array<IBus>;
  @Input() search: string;

  @Input() idWorkspaceSelected: number;
  @Input() idBusSelected: string;
  @Input() idContainerSelected: string;
  @Input() idComponentSelected: string;
  @Input() idServiceUnitSelected: string;

  constructor(private store$: Store<IStore>) { }

  getBusDetails(idBus: string) {
    this.store$.dispatch({ type: WorkspaceActions.FETCH_BUS_DETAILS, payload: { idWorkspace: this.idWorkspaceSelected, idBus } });
  }

  fold(idBus: string) {
    this.store$.dispatch({ type: WorkspaceActions.TOGGLE_FOLD_BUS, payload: { idBus } });
    return false;
  }
}
