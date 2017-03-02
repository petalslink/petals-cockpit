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

import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from 'ng2-translate';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';

import { LANGUAGES } from './core/opaque-tokens';
import { IStore } from './shared/interfaces/store.interface';
import { Ui } from './shared/state/ui.reducer';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private _languageSub: Subscription;
  public notificationOptions = {
    position: ['bottom', 'right'],
    // this timeout doesn't make any sense
    // should open an issue on Github
    // https://github.com/flauc/angular2-notifications
    timeOut: 2500,
    lastOnBottom: true,
    showProgressBar: true,
    pauseOnHover: true,
    clickToClose: true
  };

  constructor(
    private _translate: TranslateService,
    @Inject(LANGUAGES) public languages: any,
    private _store$: Store<IStore>
  ) { }

  ngOnInit() {
    // default and fallback language
    // if a translation isn't found in a language,
    // it'll try to get it on the default language
    // by default here, we take the first of the array
    this._translate.setDefaultLang(this.languages[0]);
    this._store$.dispatch({ type: Ui.SET_LANGUAGE, payload: this.languages[0] });

    // when the language changes in store,
    // change it in translate provider
    this._languageSub = this._store$
      .select(state => state.ui.language)
      .filter(language => language !== '')
      .map(language => {
        this._translate.use(language);
      })
      .subscribe();
  }

  ngOnDestroy() {
    this._languageSub.unsubscribe();
  }
}
