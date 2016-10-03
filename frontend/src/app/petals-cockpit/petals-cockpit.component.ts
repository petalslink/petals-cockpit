import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { USR_IS_DISCONNECTING } from '../reducers/user.reducer';

@Component({
  selector: 'app-petals-cockpit',
  templateUrl: './petals-cockpit.component.html',
  styleUrls: ['./petals-cockpit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PetalsCockpitComponent {
  tabs: Array < { title: string, url: string } >;

  constructor(private router: Router) {
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
    this.router.navigate(['/login']);
  }
}
