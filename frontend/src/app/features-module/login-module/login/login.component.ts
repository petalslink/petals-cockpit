import {Component, ChangeDetectionStrategy, OnInit, ViewChild} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { USR_IS_CONNECTING } from '../../../shared-module/reducers/user.reducer';
import { AppState } from '../../../app.state';
import { UserState } from '../../../shared-module/reducers/user.state';
import { IUser } from '../../../shared-module/interfaces/user.interface';
import { MdInput } from '@angular/material';

@Component({
  selector: 'app-login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
  private user$: Observable<UserState>;
  @ViewChild('nameInput') nameInput: MdInput;

  constructor(private store: Store<AppState>) {
    this.user$ = <Observable<UserState>>store.select('user');
  }

  ngOnInit() {
    this.nameInput.focus();
  }

  connectUser(user: IUser) {
    this.store.dispatch({ type: USR_IS_CONNECTING, payload: user });
  }
}
