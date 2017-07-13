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

import { Component, OnInit, OnDestroy } from '@angular/core';

import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { Ui } from 'app/shared/state/ui.actions';
import { IStore } from 'app/shared/state/store.interface';
import { IUser, ICurrentUser } from 'app/shared/state/users.interface';
import { getAllUsers, getCurrentUser } from 'app/shared/state/users.selectors';
import { Users } from 'app/shared/state/users.actions';

import { IUserNew } from 'app/shared/services/users.service';

@Component({
  selector: 'app-administration',
  templateUrl: './administration.component.html',
  styleUrls: ['./administration.component.scss'],
})
export class AdministrationComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  users$: Observable<IUser[]>;
  user$: Observable<ICurrentUser>;
  isFetchingUsers$: Observable<boolean>;

  constructor(private store$: Store<IStore>) {}

  ngOnInit() {
    this.store$.dispatch(
      new Ui.SetTitles({
        titleMainPart1: 'Petals Cockpit',
        titleMainPart2: 'Administration',
      })
    );

    this.users$ = this.store$
      .let(getAllUsers)
      .map(users => users.sort((u1, u2) => u1.id.localeCompare(u2.id)));
    this.user$ = this.store$.let(getCurrentUser());
    this.isFetchingUsers$ = this.store$.select(
      state => state.users.isFetchingUsers
    );

    this.user$
      .first()
      .filter(u => u.isAdmin)
      .do(() => this.store$.dispatch(new Users.FetchAll()))
      .subscribe();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  onAdd(user: IUserNew) {
    this.store$.dispatch(new Users.Add(user));
  }

  onSave(id: string, changes: { name?: string; password?: string }) {
    this.store$.dispatch(new Users.Modify({ id, changes }));
  }

  onDelete(id: string) {
    this.store$.dispatch(new Users.Delete({ id }));
  }
}
