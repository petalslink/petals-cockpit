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

import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { EMPTY, Observable, Subject } from 'rxjs';
import { catchError, takeUntil, tap } from 'rxjs/operators';

import { FormErrorStateMatcher } from '@shared/helpers/form.helper';
import { getErrorMessage } from '@shared/helpers/shared.helper';
import { ILdapStatus, LdapService } from '@shared/services/ldap.service';
import { IUserSetup } from '@shared/services/users.service';
import { IStore } from '@shared/state/store.interface';
import { Users } from '@shared/state/users.actions';
import { IUsersTable } from '@shared/state/users.interface';
import { getUsers } from '@shared/state/users.selectors';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss'],
})
export class SetupComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  isLdapStatus$: Observable<ILdapStatus>;
  users$: Observable<IUsersTable>;

  focusUsernameInput = false;
  focusTokenInput = true;

  matcher = new FormErrorStateMatcher();
  setupForm: FormGroup;
  show: boolean;

  constructor(
    private store$: Store<IStore>,
    private ldap: LdapService,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    this.users$ = this.store$.pipe(select(getUsers));

    if (!token) {
      this.focusTokenInput = true;
    } else {
      this.focusUsernameInput = true;
    }
    this.isLdapStatus$ = this.ldap.getLdapStatus().pipe(
      takeUntil(this.onDestroy$),
      tap(isLdapStatus => {
        this.buildForm(isLdapStatus.isLdapMode, token);
      }),
      catchError((err: HttpErrorResponse) => {
        getErrorMessage(err);
        return EMPTY;
      })
    );
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  buildForm(isLdapMode: boolean, token: string) {
    if (isLdapMode) {
      this.setupForm = this.fb.group({
        token: [token || '', Validators.required],
        username: ['', Validators.required],
      });
    } else {
      this.setupForm = this.fb.group({
        token: [token || '', Validators.required],
        username: ['', Validators.required],
        password: ['', Validators.required],
        name: ['', Validators.required],
      });
      this.show = false;
    }
  }

  onSubmit(value: IUserSetup) {
    this.store$.dispatch(
      new Users.Setup({
        value: value,
      })
    );
  }

  togglePassword() {
    this.show = !this.show;
  }
}
