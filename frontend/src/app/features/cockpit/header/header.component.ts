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

import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Store } from '@ngrx/store';

import { IStore } from 'app/shared/state/store.interface';
import { IUi } from 'app/shared/state/ui.interface';
import { Ui } from 'app/shared/state/ui.actions';
import { ICurrentUser } from 'app/shared/state/users.interface';
import { Users } from 'app/shared/state/users.actions';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit {
  @Input() largeScreen: boolean;
  @Input() ui: IUi;
  @Input() user: ICurrentUser;
  @Input() isDisconnecting: boolean;
  @Input() isOnWorkspace: boolean;

  showShadow = true;

  constructor(private store$: Store<IStore>) {}

  ngOnInit() {}

  logo() {
    return `./assets/img/${this.largeScreen
      ? 'logo-petals-cockpit'
      : 'logo-petals-cockpit-without-text'}.png`;
  }

  toggleSidenav() {
    this.store$.dispatch(new Ui.ToggleSidenav());
  }

  disconnect() {
    this.store$.dispatch(new Users.Disconnect());
  }
}
