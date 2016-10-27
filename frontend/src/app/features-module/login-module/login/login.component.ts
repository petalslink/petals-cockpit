// angular modules
import { Component, ChangeDetectionStrategy, OnInit, ViewChild, OnDestroy } from '@angular/core';

// rxjs
import { Subscription } from 'rxjs';

// angular material
import { MdInput } from '@angular/material';

// ngrx
import { Store } from '@ngrx/store';

// our actions
import { USR_IS_CONNECTING } from '../../../shared-module/reducers/user.reducer';

// our interfaces
import { IStore } from '../../../shared-module/interfaces/store.interface';
import { IUser, IUserRecord } from '../../../shared-module/interfaces/user.interface';

@Component({
  selector: 'app-login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit, OnDestroy {
  private user: IUser;
  private userSubscription: Subscription;

  // TODO: Review needed, isn't there a directive for that ?
  @ViewChild('nameInput') nameInput: MdInput;

  constructor(private store$: Store<IStore>) {
    this.userSubscription =
      store$.select('user')
        .map((userR: IUserRecord) => userR.toJS())
        .subscribe((user: IUser) => this.user = user);
  }

  ngOnInit() {
    this.nameInput.focus();
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }

  connectUser(user: IUser) {
    this.store$.dispatch({ type: USR_IS_CONNECTING, payload: user });
  }
}
