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

import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { NotificationsService } from 'angular2-notifications';
import { Observable } from 'rxjs/Observable';
import { empty } from 'rxjs/observable/empty';
import { of } from 'rxjs/observable/of';
import {
  catchError,
  flatMap,
  map,
  mergeMap,
  switchMap,
  withLatestFrom,
} from 'rxjs/operators';

import { SharedLibraries } from 'app/features/cockpit/workspaces/state/shared-libraries/shared-libraries.actions';
import { toJsTable } from 'app/shared/helpers/jstable.helper';
import { getErrorMessage } from 'app/shared/helpers/shared.helper';
import {
  ESharedLibraryState,
  SharedLibrariesService,
} from 'app/shared/services/shared-libraries.service';
import { SseActions } from 'app/shared/services/sse.service';
import { IStore } from 'app/shared/state/store.interface';
import { environment } from 'environments/environment';

@Injectable()
export class SharedLibrariesEffects {
  constructor(
    private store$: Store<IStore>,
    private actions$: Actions,
    private sharedLibrariesService: SharedLibrariesService,
    private notifications: NotificationsService
  ) {}

  @Effect()
  watchDeployed$: Observable<Action> = this.actions$
    .ofType<SseActions.SlDeployed>(SseActions.SlDeployedType)
    .pipe(
      map(action => {
        const data = action.payload;
        const sls = toJsTable(data.sharedLibraries);
        return new SharedLibraries.Added(sls);
      })
    );

  @Effect()
  fetchDetails$: Observable<Action> = this.actions$
    .ofType<SharedLibraries.FetchDetails>(SharedLibraries.FetchDetailsType)
    .pipe(
      switchMap(action =>
        this.sharedLibrariesService.getDetails(action.payload.id).pipe(
          map(
            data =>
              new SharedLibraries.FetchDetailsSuccess({
                id: action.payload.id,
                data,
              })
          ),
          catchError((err: HttpErrorResponse) => {
            if (environment.debug) {
              console.group();
              console.warn(
                'Error caught in shared-libraries.effects: ofType(SharedLibraries.FetchDetails)'
              );
              console.error(err);
              console.groupEnd();
            }

            return of(new SharedLibraries.FetchDetailsError(action.payload));
          })
        )
      )
    );

  @Effect()
  changeState$: Observable<Action> = this.actions$
    .ofType<SharedLibraries.ChangeState>(SharedLibraries.ChangeStateType)
    .pipe(
      withLatestFrom(this.store$),
      switchMap(([action, store]) => {
        return this.sharedLibrariesService
          .putState(
            store.workspaces.selectedWorkspaceId,
            action.payload.id,
            action.payload.state
          )
          .pipe(
            // response will be handled by sse
            mergeMap(_ => empty<Action>()),
            catchError((err: HttpErrorResponse) => {
              if (environment.debug) {
                console.group();
                console.warn(
                  'Error caught in share-libraries.effects: ofType(SharedLibraries.ChangeState)'
                );
                console.error(err);
                console.groupEnd();
              }

              return of(
                new SharedLibraries.ChangeStateError({
                  id: action.payload.id,
                  errorChangeState: getErrorMessage(err),
                })
              );
            })
          );
      })
    );

  @Effect()
  watchStateChanged$: Observable<Action> = this.actions$
    .ofType<SseActions.SlStateChange>(SseActions.SlStateChangeType)
    .pipe(
      withLatestFrom(this.store$),
      flatMap(([action, store]) => {
        const data = action.payload;

        const sl = store.sharedLibraries.byId[data.id];

        if (data.state === ESharedLibraryState.Unloaded) {
          this.notifications.success(
            'Shared Library Unloaded',
            `'${sl.name}' has been unloaded`
          );

          return of(new SharedLibraries.Removed(sl));
        } else {
          return empty();
        }
      })
    );
}
