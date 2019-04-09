/**
 * Copyright (C) 2017-2019 Linagora
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

import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { Store } from '@ngrx/store';

import { IStore } from '@shared/state/store.interface';
import { Ui } from '@shared/state/ui.actions';
import { Users } from '@shared/state/users.actions';
import { ICurrentUser } from '@shared/state/users.interface';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent implements OnInit {
  @Input() user: ICurrentUser;
  @Input() isDisconnecting: boolean;

  constructor(private store$: Store<IStore>) {}

  ngOnInit() {}

  toggleSidenav() {
    this.store$.dispatch(new Ui.ToggleSidenav());
  }

  disconnect() {
    this.store$.dispatch(new Users.Disconnect());
  }
}
