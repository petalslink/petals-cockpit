import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { USR_IS_DISCONNECTING } from '../../../shared-module/reducers/user.reducer';
import { AppState } from '../../../app.state';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ConfigState } from '../../../shared-module/reducers/config.state';
import { UserState } from '../../../shared-module/reducers/user.state';

@Component({
  selector: 'app-petals-cockpit',
  templateUrl: 'cockpit.component.html',
  styleUrls: ['cockpit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CockpitComponent {
  private user$: Observable<UserState>;
  private config$: Observable<ConfigState>;
  private tabs: Array<{ title: string, url: string }>;

  constructor(private store: Store<AppState>, private router: Router) {
    console.log('cockpit component');
    this.user$ = <Observable<UserState>>store.select('user');
    this.config$ = <Observable<ConfigState>>store.select('config');

    this.tabs = [
      {
        title: 'Petals',
        url: 'cockpit'
      },
      {
        title: 'Service',
        url: 'cockpit'
      },
      {
        title: 'API',
        url: 'cockpit'
      }
    ];
  }

  openTab(index) {
    this.router.navigate(['/', this.tabs[index].url]);
  }

  disconnectUser() {
    this.store.dispatch({ type: USR_IS_DISCONNECTING });
  }
}
