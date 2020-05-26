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

import { MatDialog } from '@angular/material/dialog';
import { ConfirmMessageDialogComponent } from '@shared/components/confirm-message-dialog/confirm-message-dialog.component';
import { IUserNew } from '@shared/services/users.service';
import { IStore } from '@shared/state/store.interface';
import { Users } from '@shared/state/users.actions';
import { ICurrentUser, IUser, IUserRow } from '@shared/state/users.interface';
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
  isAdministratorChecked: boolean;
  isCurrentUserModifyingAdministrator = false;
  isLastAdmin: boolean;

  users$: Observable<IUserRow[]>;
  user$: Observable<ICurrentUser>;
  isFetchingUsers$: Observable<boolean>;

  @ViewChildren('editUser') children: QueryList<AddEditUserComponent>;
  @ViewChild('addUser') child: AddEditUserComponent;

  constructor(private store$: Store<IStore>, private dialog: MatDialog) {}

  ngOnInit() {
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

    this.users$
      .pipe(
        tap(users => {
          const count = users.filter(user => user.isAdmin).length;
          this.isLastAdmin = count === 1;
        })
      )
      .subscribe();
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

  onSave(
    id: string,
    changes: { name?: string; password?: string; isAdmin?: boolean }
  ) {
    this.store$.dispatch(new Users.Modify({ id, changes }));
  }

  onDelete(id: string) {
    this.store$.dispatch(new Users.Delete({ id }));
  }

  trackByUser(i: number, user: IUser) {
    return user.id;
  }

  doSubmitAdministrator(id: string, isAdmin: boolean) {
    this.isAdministratorChecked = isAdmin;
    const changes: { isAdmin: boolean } = {
      isAdmin,
    };
    const currentUserSelfDemoting = this.currentUser.id === id && !isAdmin;

    if (currentUserSelfDemoting) {
      this.isCurrentUserModifyingAdministrator = true;
      this.dialog
        .open(ConfirmMessageDialogComponent, {
          data: {
            title: 'Remove admin role?',
            message:
              'You will no longer be admin.\nYou will be redirected to the workspaces selection page.',
            confirmButtonText: 'REMOVE',
          },
        })
        .beforeClose()
        .pipe(
          tap(confirm => {
            if (confirm) {
              this.store$.dispatch(new Users.Modify({ id, changes }));
            } else {
              this.isAdministratorChecked = true;
              this.isCurrentUserModifyingAdministrator = false;
            }
          })
        )
        .subscribe();
    } else {
      this.store$.dispatch(new Users.Modify({ id, changes }));
    }
  }
}
