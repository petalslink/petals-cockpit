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

// translate
import { TranslateService } from 'ng2-translate';

// rxjs
import { Subscription } from 'rxjs';

// our actions
import { ConfigActions } from '../../../shared-module/reducers/config.actions';

// our interfaces
import { IConfigRecord, IConfig } from '../../../shared-module/interfaces/config.interface';
import { IStore } from '../../../shared-module/interfaces/store.interface';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnDestroy {
  private config: IConfig;
  private configSub: Subscription;

  langOptions = [
    'fr',
    'en'
  ];

  private lang: string;

  constructor(private store$: Store<IStore>, private translate: TranslateService) {
    this.configSub =
      store$.select('config')
        .map((configR: IConfigRecord) => configR.toJS())
        .subscribe((config: IConfig) => this.config = config);

    this.lang = this.translate.currentLang;
  }

  ngOnDestroy() {
    this.configSub.unsubscribe();
  }

  toggleTheme() {
    this.store$.dispatch({ type: ConfigActions.TOGGLE_THEME });
  }

  changeLanguageTo(lang) {
    this.lang = lang || this.lang;
    this.translate.use(this.lang);
  }
}
