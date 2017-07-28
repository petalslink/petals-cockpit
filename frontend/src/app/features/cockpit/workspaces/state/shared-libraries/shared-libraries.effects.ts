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

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { NotificationsService } from 'angular2-notifications';
import { Observable } from 'rxjs/Observable';

import { SharedLibraries } from 'app/features/cockpit/workspaces/state/shared-libraries/shared-libraries.actions';
import { toJsTable } from 'app/shared/helpers/jstable.helper';
import {
  ESharedLibraryState,
  ISharedLibraryBackendSSE,
  SharedLibrariesService,
  SharedLibraryState,
} from 'app/shared/services/shared-libraries.service';
import { SseWorkspaceEvent } from 'app/shared/services/sse.service';
import { IStore } from 'app/shared/state/store.interface';
import { environment } from 'environments/environment';

@Injectable()
export class SharedLibrariesEffects {
  constructor(
    private store$: Store<IStore>,
    private actions$: Actions,
    private router: Router,
    private sharedLibrariesService: SharedLibrariesService,
    private notifications: NotificationsService
  ) {}

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  watchDelpoyed$: Observable<Action> = this.actions$
    .ofType(SseWorkspaceEvent.SL_DEPLOYED.action)
    .map(action => {
      const data = action.payload;
      const sls = toJsTable<ISharedLibraryBackendSSE>(data.sharedLibraries);
      return new SharedLibraries.Added(sls);
    });

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  fetchDetails$: Observable<Action> = this.actions$
    .ofType(SharedLibraries.FetchDetailsType)
    .switchMap((action: SharedLibraries.FetchDetails) =>
      this.sharedLibrariesService
        .getDetails(action.payload.id)
        .map(
          data =>
            new SharedLibraries.FetchDetailsSuccess({
              id: action.payload.id,
              data,
            })
        )
        .catch(err => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error caught in shared-libraries.effects: ofType(SharedLibraries.FetchDetailsType)'
            );
            console.error(err);
            console.groupEnd();
          }

          return Observable.of(
            new SharedLibraries.FetchDetailsError(action.payload)
          );
        })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  changeState$: Observable<Action> = this.actions$
    .ofType(SharedLibraries.ChangeStateType)
    .withLatestFrom(this.store$)
    .switchMap(([action, store]: [SharedLibraries.ChangeState, IStore]) => {
      return (
        this.sharedLibrariesService
          .putState(
            store.workspaces.selectedWorkspaceId,
            action.payload.id,
            action.payload.state
          )
          // response will be handled by sse
          .mergeMap(_ => Observable.empty<Action>())
          .catch(err => {
            if (environment.debug) {
              console.group();
              console.warn(
                'Error caught in share-libraries.effects: ofType(SharedLibraries.ChangeStateType)'
              );
              console.error(err);
              console.groupEnd();
            }

            return Observable.of(
              new SharedLibraries.ChangeStateError({
                id: action.payload.id,
                errorChangeState: err.json().message,
              })
            );
          })
      );
    });

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  watchStateChanged$: Observable<Action> = this.actions$
    .ofType(SseWorkspaceEvent.SL_STATE_CHANGE.action)
    .withLatestFrom(this.store$)
    .flatMap(([action, store]) => {
      const data: { id: string; state: SharedLibraryState } = action.payload;

      const sl = store.sharedLibraries.byId[data.id];

      if (data.state === ESharedLibraryState.Unloaded) {
        if (store.sharedLibraries.selectedSharedLibraryId === sl.id) {
          this.router.navigate([
            '/workspaces',
            store.workspaces.selectedWorkspaceId,
          ]);
        }

        this.notifications.success(
          'Shared Library Unloaded',
          `'${sl.name}' has been unloaded`
        );

        return Observable.of(new SharedLibraries.Removed(sl));
      } else {
        return Observable.empty();
      }
    });
}
