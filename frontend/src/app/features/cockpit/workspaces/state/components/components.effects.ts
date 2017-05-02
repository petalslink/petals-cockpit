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
import { Response } from '@angular/http';
import { Action, Store } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { NotificationsService } from 'angular2-notifications';

import { environment } from './../../../../../../environments/environment';
import { Components } from './components.reducer';
import { ComponentsService } from './../../../../../shared/services/components.service';
import { IStore } from '../../../../../shared/interfaces/store.interface';
import { ComponentState } from 'app/features/cockpit/workspaces/state/components/component.interface';
import { IServiceUnitBackendSSE } from 'app/features/cockpit/workspaces/state/service-units/service-unit.interface';

@Injectable()
export class ComponentsEffects {
  constructor(
    private router: Router,
    private store$: Store<IStore>,
    private actions$: Actions,
    private componentsService: ComponentsService,
    private notification: NotificationsService
  ) { }

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) fetchContainersDetails$: Observable<Action> = this.actions$
    .ofType(Components.FETCH_COMPONENT_DETAILS)
    .switchMap((action: { type: string, payload: { componentId: string } }) =>
      this.componentsService.getDetailsComponent(action.payload.componentId)
        .map((res: Response) => {
          const data = res.json();
          return { type: Components.FETCH_COMPONENT_DETAILS_SUCCESS, payload: { componentId: action.payload.componentId, data } };
        })
        .catch((err) => {
          if (environment.debug) {
            console.group();
            console.warn('Error caught in components.effects.ts: ofType(Components.FETCH_COMPONENT_DETAILS)');
            console.error(err);
            console.groupEnd();
          }

          return Observable.of({
            type: Components.FETCH_COMPONENT_DETAILS_ERROR,
            payload: { componentId: action.payload.componentId }
          });
        })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) changeState$: Observable<Action> = this.actions$
    .ofType(Components.CHANGE_STATE)
    .withLatestFrom(this.store$.select(state => state.workspaces.selectedWorkspaceId))
    .switchMap(([action, workspaceId]:
      [
        { type: string, payload: { componentId: string, newState: ComponentState, parameters: { [key: string]: string } } },
        string
      ]) =>
      this.componentsService.putState(workspaceId, action.payload.componentId, action.payload.newState, action.payload.parameters)
        .mergeMap(_ => Observable.empty())
        .catch((err) => {
          if (environment.debug) {
            console.group();
            console.warn('Error catched in components.effects: ofType(Components.CHANGE_STATE)');
            console.error(err);
            console.groupEnd();
          }

          return Observable.of({
            type: Components.CHANGE_STATE_ERROR,
            payload: { componentId: action.payload.componentId, errorChangeState: err._body }
          });
        })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) changeStateSuccess$: Observable<Action> = this.actions$
    .ofType(Components.CHANGE_STATE_SUCCESS)
    .map((action: { type: string, payload: { componentId: string, newState: string } }) =>
      ({ type: Components.FETCH_COMPONENT_DETAILS, payload: { componentId: action.payload.componentId } })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) deployServiceUnit$: Observable<Action> = this.actions$
    .ofType(Components.DEPLOY_SERVICE_UNIT)
    .withLatestFrom(this.store$.select(state => state.workspaces.selectedWorkspaceId))
    .switchMap(([action, workspaceId]: [{ type: string, payload: { file: File, componentId: string, serviceUnitName: string } }, string]) =>
      this.componentsService.deploySu(workspaceId, action.payload.componentId, action.payload.file, action.payload.serviceUnitName)
        .mergeMap(_ => Observable.empty())
        .catch((err) => {
          if (environment.debug) {
            console.group();
            console.warn('Error caught in components.effects: ofType(Components.DEPLOY_SERVICE_UNIT)');
            console.error(err);
            console.groupEnd();
          }

          this.notification.error(
            'Deploy Service-Unit failed',
            `An error occurred when trying to deploy the file "${action.payload.file.name}"`
          );

          return Observable.of({
            type: Components.DEPLOY_SERVICE_UNIT_ERROR,
            payload: { componentId: action.payload.componentId, errorDeployment: err._body }
          });
        })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: false }) deployServiceUnitSuccess$: Observable<void> = this.actions$
    .ofType(Components.DEPLOY_SERVICE_UNIT_SUCCESS)
    .withLatestFrom(this.store$.select(state => state.workspaces.selectedWorkspaceId))
    .do(([{ payload }, workspaceId]: [{ payload: IServiceUnitBackendSSE }, string]) => {
      this.router.navigate(['workspaces', workspaceId, 'petals', 'service-units', payload.id]);
    })
    .mapTo(null);
}
