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
import { Action } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { NotificationsService } from 'angular2-notifications';

import { environment } from 'environments/environment';
import {
  SharedLibrariesService,
  ISharedLibraryBackendSSE,
} from 'app/shared/services/shared-libraries.service';

import { SseWorkspaceEvent } from 'app/shared/services/sse.service';
import { toJsTable } from 'app/shared/helpers/jstable.helper';
import { batchActions } from 'app/shared/helpers/batch-actions.helper';

import { SharedLibraries } from 'app/features/cockpit/workspaces/state/shared-libraries/shared-libraries.actions';
import { Containers } from 'app/features/cockpit/workspaces/state/containers/containers.actions';

@Injectable()
export class SharedLibrariesEffects {
  constructor(
    private actions$: Actions,
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

      // there is only one sl deployed here
      const sl = sls.byId[sls.allIds[0]];

      this.notifications.success(
        'Shared Library Deployed',
        `${sl.name} has been successfully deployed`
      );

      return batchActions([
        // add the component
        new SharedLibraries.Added(sls),
        // add it to the container
        new Containers.DeploySharedLibrarySuccess(sl),
      ]);
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
}
