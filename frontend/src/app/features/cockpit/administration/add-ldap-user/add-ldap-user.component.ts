/**
 * Copyright (C) 2017-2020 Linagora
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { combineLatest, Observable, Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  takeUntil,
  tap,
} from 'rxjs/operators';

import {
  FormErrorStateMatcher,
  getFormErrors,
} from '@shared/helpers/form.helper';
import { IUserNew } from '@shared/services/users.service';
import { IStore } from '@shared/state/store.interface';
import { Users } from '@shared/state/users.actions';
import { IUserLDAP, IUserRow } from '@shared/state/users.interface';

@Component({
  selector: 'app-add-ldap-user',
  templateUrl: './add-ldap-user.component.html',
  styleUrls: ['./add-ldap-user.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddLdapUserComponent implements OnInit, OnDestroy {
  onDestroy$ = new Subject<void>();

  filteredUsers$: Observable<IUserLDAP[]>;
  isFetchingLdapUsers$: Observable<boolean>;

  ldapSearchList: IUserLDAP[];
  localUsers: { [key: string]: IUserRow };

  addLdapUserForm: FormGroup;

  formErrors = {
    userSearchCtrl: '',
  };

  matcher = new FormErrorStateMatcher();

  msgOptMapping: { [k: string]: string } = {
    '=0': 'There is no user found.',
    '=1': '1 user is matching this search.',
    other: '# users are matching this search.',
  };

  @Output()
  evtSubmit = new EventEmitter<
    | IUserNew
    | { username: string; name?: string; password?: string; isAdmin: boolean }
  >();

  constructor(
    private fb: FormBuilder,
    private store$: Store<IStore>,
    private actions$: Actions
  ) {}

  ngOnInit() {
    this.addLdapUserForm = this.fb.group({
      userSearchCtrl: ['', Validators.required],
    });

    this.isFetchingLdapUsers$ = this.store$.pipe(
      select(state => state.users.isFetchingLdapUsers)
    );

    this.addLdapUserForm
      .get('userSearchCtrl')
      .valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        filter(val => val !== null),
        tap(val => {
          if (val) {
            this.store$.dispatch(new Users.FetchLdapUsers(val.trim()));
          } else {
            this.store$.dispatch(new Users.CleanLdapUsers());
          }
          this.formErrors = getFormErrors(
            this.addLdapUserForm,
            this.formErrors
          );
        }),
        takeUntil(this.onDestroy$)
      )
      .subscribe();

    this.filteredUsers$ = combineLatest(
      this.store$.pipe(select(state => state.users.ldapSearchList)),
      this.store$.pipe(select(state => state.users.byId))
    ).pipe(
      map(([ldapSearchList, localUsers]) =>
        ldapSearchList.filter(ldapItem => !localUsers[ldapItem.username])
      )
    );

    this.actions$
      .pipe(
        ofType(Users.AddSuccessType),
        takeUntil(this.onDestroy$),
        tap(_ => {
          this.addLdapUserForm.reset(),
            this.store$.dispatch(new Users.CleanLdapUsers());
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();

    this.store$.dispatch(new Users.CleanLdapUsers());
  }

  doSubmit(username: string, name: string, isAdmin: boolean) {
    const value: IUserNew = {
      username,
      name,
      password: '',
      isAdmin,
    };
    this.evtSubmit.emit(value);
  }
}
