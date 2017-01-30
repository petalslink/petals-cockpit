import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from 'ng2-translate';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';

import { LANGUAGES } from './core/opaque-tokens';
import { IUi } from './shared/interfaces/ui.interface';
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
    @Inject(LANGUAGES) public languages,
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
