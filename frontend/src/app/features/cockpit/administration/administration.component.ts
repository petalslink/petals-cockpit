/**
 * Copyright (C) 2017-2019 Linagora
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
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { filter, first, map, tap } from 'rxjs/operators';

import { IUserNew } from '@shared/services/users.service';
import { IStore } from '@shared/state/store.interface';
import { Ui } from '@shared/state/ui.actions';
import { isLargeScreen } from '@shared/state/ui.selectors';
import { Users } from '@shared/state/users.actions';
import { ICurrentUser, IUser } from '@shared/state/users.interface';
import { getAllUsers, getCurrentUser } from '@shared/state/users.selectors';
import { AddEditUserComponent } from './add-edit-user/add-edit-user.component';

@Component({
  selector: 'app-administration',
  templateUrl: './administration.component.html',
  styleUrls: ['./administration.component.scss'],
})
export class AdministrationComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  currentUser: ICurrentUser;

  users$: Observable<IUser[]>;
  user$: Observable<ICurrentUser>;
  isFetchingUsers$: Observable<boolean>;
  isLargeScreen$: Observable<boolean>;

  @ViewChildren('editUser') children: QueryList<AddEditUserComponent>;
  @ViewChild('addUser') child: AddEditUserComponent;

  constructor(private store$: Store<IStore>) {}

  ngOnInit() {
    this.store$.dispatch(
      new Ui.SetTitles({
        titleMainPart1: 'Petals Cockpit',
        titleMainPart2: 'Administration',
      })
    );

    this.users$ = this.store$.pipe(
      select(getAllUsers),
      map(users => users.sort((u1, u2) => u1.id.localeCompare(u2.id)))
    );

    this.user$ = this.store$.pipe(getCurrentUser);

    this.isFetchingUsers$ = this.store$.pipe(
      select(state => state.users.isFetchingUsers)
    );

    this.user$
      .pipe(
        tap(currentUser => (this.currentUser = currentUser)),
        first(),
        filter(u => u.isAdmin),
        tap(() => this.store$.dispatch(new Users.FetchAll()))
      )
      .subscribe();

    this.isLargeScreen$ = this.store$.pipe(isLargeScreen);
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  onResetAddUserForm() {
    if (!this.currentUser.isFromLdap) {
      this.child.reset();
    }
  }

  onResetEditUserForm(i: number) {
    if (!this.currentUser.isFromLdap) {
      this.children.toArray()[i].reset();
    }
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

  trackByUser(i: number, user: IUser) {
    return user.id;
  }
}
