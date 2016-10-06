// angular modules
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

// rxjs
import { Observable } from 'rxjs';

// ngrx - store
import { Store } from '@ngrx/store';

// our states
import { AppState } from '../../../app.state';
import { ConfigState } from '../../../shared-module/reducers/config.state';
import { UserState } from '../../../shared-module/reducers/user.state';
import { WorkspacesState } from '../../../shared-module/reducers/workspaces.state';

// our actions
import { USR_IS_DISCONNECTING } from '../../../shared-module/reducers/user.reducer';

@Component({
  selector: 'app-petals-cockpit',
  templateUrl: 'cockpit.component.html',
  styleUrls: ['cockpit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CockpitComponent {
  private user$: Observable<UserState>;
  private config$: Observable<ConfigState>;
  private workspaces$: Observable<WorkspacesState>;

  private tabs: Array<{ title: string, url: string }>;

  constructor(private store: Store<AppState>, private router: Router) {
    this.user$ = <Observable<UserState>>store.select('user');
    this.config$ = <Observable<ConfigState>>store.select('config');
    this.workspaces$ = <Observable<WorkspacesState>>store.select('workspaces');

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
