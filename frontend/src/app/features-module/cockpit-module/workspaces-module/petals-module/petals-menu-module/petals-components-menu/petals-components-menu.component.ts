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
import { IComponent } from '../../../../../../shared-module/interfaces/petals.interface';

// our actions
import { WorkspaceActions } from './../../../../../../shared-module/reducers/workspace.actions';
import { ConfigActions } from '../../../../../../shared-module/reducers/config.actions';

@Component({
  selector: 'app-components-menu',
  templateUrl: 'petals-components-menu.component.html',
  styleUrls: ['petals-components-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComponentsMenuComponent {
  @Input() components: Array<IComponent>;
  @Input() search: string;

  @Input() idBus: number;
  @Input() idContainer: number;

  @Input() idWorkspaceSelected: string;
  @Input() idComponentSelected: string;
  @Input() idServiceUnitSelected: string;

  constructor(private store$: Store<IStore>) { }

  fold(idBus: string, idContainer: string, idComponent: string) {
    this.store$.dispatch({ type: WorkspaceActions.TOGGLE_FOLD_COMPONENT, payload: { idBus, idContainer, idComponent } });
    return false;
  }

  closeSidenavMobile() {
    this.store$.dispatch({ type: ConfigActions.CLOSE_SIDENAV_IF_MOBILE });
  }
}
