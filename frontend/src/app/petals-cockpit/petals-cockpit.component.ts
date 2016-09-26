import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { INCREMENT, DECREMENT, RESET } from '../reducers/counter.reducer';

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
  private counter: Observable<number>;

  constructor(public store: Store<AppState>) {
    this.counter = store.select('counter');
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
}
