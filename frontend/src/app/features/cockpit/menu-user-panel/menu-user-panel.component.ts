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
import { Store } from '@ngrx/store';

import { IUser } from './../../../shared/interfaces/user.interface';
import { IStore } from './../../../shared/interfaces/store.interface';
import { Users } from './../../../shared/state/users.reducer';

@Component({
  selector: 'app-menu-user-panel',
  templateUrl: './menu-user-panel.component.html',
  styleUrls: ['./menu-user-panel.component.scss']
})
export class MenuUserPanelComponent implements OnInit {
  public user = <IUser>{
    name: 'Chuck NORRIS',
    username: 'Admin'
  };

  constructor(private _store$: Store<IStore>) { }

  ngOnInit() {
  }

  disconnect() {
    this._store$.dispatch({ type: Users.DISCONNECT_USER });
  }
}