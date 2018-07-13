/**
 * Copyright (C) 2017-2018 Linagora
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
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  takeUntil,
  tap,
} from 'rxjs/operators';

import {
  FormErrorStateMatcher,
  getFormErrors,
} from '@shared/helpers/form.helper';
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
    '=1': 'One person is matching this search.',
    other: '# people are matching this search.',
  };

  constructor(private fb: FormBuilder, private store$: Store<IStore>) {}

  ngOnInit() {
    this.addLdapUserForm = this.fb.group({
      userSearchCtrl: ['', Validators.required],
    });

    this.isFetchingLdapUsers$ = this.store$.select(
      state => state.users.isFetchingLdapUsers
    );

    this.addLdapUserForm
      .get('userSearchCtrl')
      .valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(val => {
          if (val.trim().length > 0) {
            this.store$.dispatch(new Users.FetchLdapUsers(val));
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
      this.store$.select(state => state.users.ldapSearchList),
      this.store$.select(state => state.users.byId)
    ).pipe(
      map(([ldapSearchList, localUsers]) => {
        ldapSearchList.filter(ldapItem => !!localUsers[ldapItem.username]);

        return ldapSearchList;
      })
    );
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();

    this.store$.dispatch(new Users.CleanLdapUsers());
  }
}
