// angular modules
import { Component, OnDestroy } from '@angular/core';

// ngrx
import { Store } from '@ngrx/store';

// translate
import { TranslateService } from 'ng2-translate';

// rxjs
import { Subscription } from 'rxjs';

// our actions
import { TOGGLE_THEME } from '../../../shared-module/reducers/config.reducer';

// our interfaces
import { IConfigRecord, IConfig } from '../../../shared-module/interfaces/config.interface';
import {IStore} from '../../../shared-module/interfaces/store.interface';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnDestroy {
  private config: IConfig;
  private configSubscription: Subscription;

  private lang: string;

  constructor(private store$: Store<IStore>, private translate: TranslateService) {
    this.configSubscription =
      store$.select('config')
        .map((configR: IConfigRecord) => configR.toJS())
        .subscribe((config: IConfig) => this.config = config);
  }

  ngOnDestroy() {
    this.configSubscription.unsubscribe();
  }

  toggleTheme() {
    this.store$.dispatch({ type: TOGGLE_THEME });
  }

  changeLanguageTo() {
    this.translate.use(this.lang);
  }
}
