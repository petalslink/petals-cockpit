import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { USR_IS_CONNECTING } from '../../../shared-module/reducers/user.reducer';
import { AppState } from '../../../app.state';
import { UserState } from '../../../shared-module/reducers/user.state';
import { IUser } from '../../../shared-module/interfaces/user.interface';

@Component({
  selector: 'app-login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private user$: Observable<UserState>;

  constructor(private store: Store<AppState>) {
    this.user$ = <Observable<UserState>>store.select('user');
  }

  connectUser(user: IUser) {
    this.store.dispatch({ type: USR_IS_CONNECTING, payload: user });
  }

}
