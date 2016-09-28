import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { USR_IS_CONNECTING } from '../reducers/user.reducer';
import { AppState } from '../app.state';
import { UserState } from '../reducers/user.state';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private user$: Observable<UserState>;

  constructor(private store: Store<AppState>) {
    this.user$ = <Observable<UserState>>store.select('user');
  }

  connectUser() {
    this.store.dispatch({type: USR_IS_CONNECTING});
  }
}
