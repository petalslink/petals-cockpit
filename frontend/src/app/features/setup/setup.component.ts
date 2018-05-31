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

import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { catchError, map, takeUntil } from 'rxjs/operators';

import { getErrorMessage } from 'app/shared/helpers/shared.helper';
import { IUserSetup, UsersService } from 'app/shared/services/users.service';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss'],
})
export class SetupComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  focusUsernameInput = false;
  focusTokenInput = false;

  form: FormGroup;
  settingUp = false;
  setupFailed: string;
  setupSucceeded = false;

  constructor(
    private router: Router,
    private users: UsersService,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');

    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      token: [token || '', Validators.required],
      name: ['', Validators.required],
    });

    if (!token) {
      this.focusTokenInput = true;
    } else {
      this.focusUsernameInput = true;
    }
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  onSubmit({ value }: { value: IUserSetup }) {
    if (this.setupSucceeded) {
      this.router.navigate(['/login']);
    } else {
      this.setupFailed = null;
      this.settingUp = true;
      this.users
        .setupUser(value)
        .pipe(
          takeUntil(this.onDestroy$),
          map(res => {
            this.setupSucceeded = true;
            this.settingUp = false;
          }),
          catchError((err: HttpErrorResponse) => {
            this.setupFailed = getErrorMessage(err);
            this.settingUp = false;
            return of();
          })
        )
        .subscribe();
    }
  }
}
