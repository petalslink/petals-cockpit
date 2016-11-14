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
import { Component, OnDestroy } from '@angular/core';

// ngrx
import { Store } from '@ngrx/store';

// rxjs
import { Subscription } from 'rxjs';

// our actions
import { ConfigActions } from '../reducers/config.actions';

// our interfaces
import { IStore } from '../interfaces/store.interface';
import { IConfig, IConfigRecord } from '../interfaces/config.interface';

@Component({
  selector: 'app-toggle-theme',
  templateUrl: 'toggle-theme.component.html',
  styleUrls: ['toggle-theme.component.scss']
})
export class ToggleThemeComponent implements OnDestroy {
  private config: IConfig;
  private configSubscribe: Subscription;

  constructor(private store$: Store<IStore>) {
    this.configSubscribe = store$.select('config')
      .map((configR: IConfigRecord) => configR.toJS())
      .subscribe((config: IConfig) => this.config = config);
  }

  ngOnDestroy() {
    this.configSubscribe.unsubscribe();
  }

  toggleTheme() {
    this.store$.dispatch({ type: ConfigActions.TOGGLE_THEME });
  }
}
