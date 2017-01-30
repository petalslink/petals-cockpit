import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { IStore } from './../../shared/interfaces/store.interface';
import { Users } from './../../shared/state/users.reducer';
import { IUsersTable } from './../../shared/interfaces/users.interface';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public loginForm: FormGroup;
  public users$: Observable<IUsersTable>;

  constructor(private _store$: Store<IStore>, private _fb: FormBuilder) { }

  ngOnInit() {
    this.users$ = this._store$.select(state => state.users);

    this.loginForm = this._fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit({value}) {
    this._store$.dispatch({ type: Users.CONNECT_USER, payload: value });
  }
}
