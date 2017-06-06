/**
 * Copyright (C) 2017 Linagora
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

import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MdInputContainer } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs/Subject';

import { IStore } from 'app/shared/interfaces/store.interface';
import { isLargeScreen } from 'app/shared/state/ui.selectors';
import { UsersService, IUserSetup } from 'app/shared/services/users.service';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss']
})
export class SetupComponent implements OnInit, OnDestroy, AfterViewInit {
  private onDestroy$ = new Subject<void>();

  @ViewChild('usernameInput') usernameInput: MdInputContainer;
  @ViewChild('tokenInput') tokenInput: MdInputContainer;

  form: FormGroup;
  settingUp = false;
  setupFailed: string;
  setupSucceeded = false;

  constructor(
    private store$: Store<IStore>,
    private router: Router,
    private users: UsersService,
    private route: ActivatedRoute,
    private fb: FormBuilder) { }

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');

    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      token: [token || '', Validators.required],
      name: ['', Validators.required]
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngAfterViewInit() {
    this.store$
      .let(isLargeScreen)
      .first()
      .filter(ss => ss)
      .do(_ => {
        if (this.form.controls['token'].value !== '') {
          this.usernameInput._focusInput();
        } else {
          this.tokenInput._focusInput();
        }
      })
      .subscribe();
  }

  onSubmit({ value }: { value: IUserSetup }) {
    if (this.setupSucceeded) {
      this.router.navigate(['/login']);
    } else {
      this.setupFailed = null;
      this.settingUp = true;
      this.users.setupUser(value)
        .takeUntil(this.onDestroy$)
        .map(res => {
          this.setupSucceeded = true;
          this.settingUp = false;
        })
        .catch(err => {
          this.setupFailed = err.json().message || `${err.status} ${err.statusText}` ;
          this.settingUp = false;
          return Observable.of();
        })
        .subscribe();
    }
  }
}
