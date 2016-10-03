import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { USR_IS_DISCONNECTING } from '../reducers/user.reducer';
import { AppState } from '../app.state';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ConfigState } from '../reducers/config.state';

@Component({
  selector: 'app-petals-cockpit',
  templateUrl: './petals-cockpit.component.html',
  styleUrls: ['./petals-cockpit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PetalsCockpitComponent {
  private config$: Observable<ConfigState>;
  private tabs: Array < { title: string, url: string } >;

  constructor(private store: Store<AppState>, private router: Router) {
    this.config$ = <Observable<ConfigState>>store.select('config');

    this.tabs = [
      {
        title: 'Petals',
        url: 'petals-cockpit'
      },
      {
        title: 'Service',
        url: 'petals-cockpit'
      },
      {
        title: 'API',
        url: 'petals-cockpit'
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
