import { Component, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { TOGGLE_THEME } from '../reducers/config.reducer';
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
    this.store$.dispatch({ type: TOGGLE_THEME });
  }
}
