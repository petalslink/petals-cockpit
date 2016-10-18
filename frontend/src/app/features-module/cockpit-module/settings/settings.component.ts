// angular modules
import { Component, OnInit, OnDestroy } from '@angular/core';

// ngrx
import { Store } from '@ngrx/store';

// translate
import { TranslateService } from 'ng2-translate';

// rxjs
import { Observable, Subscription } from 'rxjs';

// our states
import { AppState } from '../../../app.state';
import { ConfigStateRecord } from '../../../shared-module/reducers/config.state';

// our actions
import { TOGGLE_THEME } from '../../../shared-module/reducers/config.reducer';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  private config$: Observable<ConfigStateRecord>;
  private isDarkTheme = true;
  private lang: string;

  private configUnsubscribe$: Subscription;

  constructor(private store: Store<AppState>, private translate: TranslateService) {
    this.config$ = <Observable<ConfigStateRecord>>store.select('config');

    this.lang = translate.currentLang;
  }

  ngOnInit() {
    this.configUnsubscribe$ = this.config$
      .map(config => config.toJS())
      .map(config => {
        this.isDarkTheme = config.isDarkTheme;
      }).subscribe();
  }

  ngOnDestroy() {
    this.configUnsubscribe$.unsubscribe();
  }

  toggleTheme() {
    this.store.dispatch({ type: TOGGLE_THEME });
  }

  changeLanguageTo() {
    this.translate.use(this.lang);
  }
}
