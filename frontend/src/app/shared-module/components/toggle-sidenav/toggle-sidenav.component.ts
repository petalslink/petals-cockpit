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

import { Component } from '@angular/core';

// ngrx - store
import { Store } from '@ngrx/store';

// our actions
import { ConfigActions } from '../../reducers/config.actions';

// interfaces
import { IStore } from '../../interfaces/store.interface';

@Component({
  selector: 'app-toggle-sidenav',
  templateUrl: './toggle-sidenav.component.html',
  styleUrls: ['./toggle-sidenav.component.scss']
})
export class ToggleSidenavComponent {

  constructor(private store$: Store<IStore>) { }

  toggleSidenav() {
    this.store$.dispatch({ type: ConfigActions.TOGGLE_SIDENAV });
  }
}
