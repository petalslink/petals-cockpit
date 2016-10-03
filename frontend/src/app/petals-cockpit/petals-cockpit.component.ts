import {Component, ChangeDetectionStrategy, ViewContainerRef} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { INCREMENT, DECREMENT, RESET } from '../reducers/counter.reducer';
import { Router } from '@angular/router';
import { USR_IS_DISCONNECTING } from '../reducers/user.reducer';

interface AppState {
  counter: number;
}

@Component({
  selector: 'app-petals-cockpit',
  templateUrl: './petals-cockpit.component.html',
  styleUrls: ['./petals-cockpit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PetalsCockpitComponent {
  title = 'Petals Cockpit';
  isCockpitTheme = false;

  private counter: Observable<number>;

  tabs: Array < { title: string, url: string } >;

  constructor(public store: Store<AppState>, private router: Router, private vcr: ViewContainerRef) {
    this.counter = store.select('counter');
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

  increment() {
    this.store.dispatch({type: INCREMENT});
  }

  decrement() {
    this.store.dispatch({type: DECREMENT});
  }

  reset() {
    this.store.dispatch({type: RESET});
  }

  openTab(index) {
    this.router.navigate(['/', this.tabs[index].url]);
  }

  disconnectUser() {
    this.store.dispatch({ type: USR_IS_DISCONNECTING });
    this.router.navigate(['/login']);
  }
}
