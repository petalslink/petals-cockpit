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

import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MdInput } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { IUserSetup, UsersService } from 'app/shared/services/users.service';
import { IStore } from 'app/shared/state/store.interface';
import { isLargeScreen } from 'app/shared/state/ui.selectors';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss'],
})
export class SetupComponent implements OnInit, OnDestroy, AfterViewInit {
  private onDestroy$ = new Subject<void>();

  @ViewChild('usernameInput') usernameInput: MdInput;
  @ViewChild('tokenInput') tokenInput: MdInput;

  form: FormGroup;
  settingUp = false;
  setupFailed: string;
  setupSucceeded = false;

  constructor(
    private store$: Store<IStore>,
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
      .do(() =>
        // this prevent change detection errors
        setTimeout(
          () =>
            !this.form.controls['token'].value
              ? this.tokenInput.focus()
              : this.usernameInput.focus()
        )
      )
      .subscribe();
  }

  onSubmit({ value }: { value: IUserSetup }) {
    if (this.setupSucceeded) {
      this.router.navigate(['/login']);
    } else {
      this.setupFailed = null;
      this.settingUp = true;
      this.users
        .setupUser(value)
        .takeUntil(this.onDestroy$)
        .map(res => {
          this.setupSucceeded = true;
          this.settingUp = false;
        })
        .catch(err => {
          this.setupFailed =
            err.json().message || `${err.status} ${err.statusText}`;
          this.settingUp = false;
          return Observable.of();
        })
        .subscribe();
    }
  }
}
