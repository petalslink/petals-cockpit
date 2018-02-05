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

import { Action } from '@ngrx/store';

import { IServiceAssemblyRow } from 'app/features/cockpit/workspaces/state/service-assemblies/service-assemblies.interface';
import { JsTable } from 'app/shared/helpers/jstable.helper';
import {
  IServiceAssemblyBackendDetails,
  IServiceAssemblyBackendSSE,
  ServiceAssemblyState,
} from 'app/shared/services/service-assemblies.service';

export namespace ServiceAssemblies {
  export const FetchedType = '[Service Assemblies] Fetched';
  export class Fetched implements Action {
    readonly type = FetchedType;
    constructor(public readonly payload: JsTable<IServiceAssemblyBackendSSE>) {}
  }

  export const AddedType = '[Service Assemblies] Added';
  export class Added implements Action {
    readonly type = AddedType;
    constructor(public readonly payload: JsTable<IServiceAssemblyBackendSSE>) {}
  }

  export const SetCurrentType = '[Service Assemblies] Set Current';
  export class SetCurrent implements Action {
    readonly type = SetCurrentType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const FetchDetailsType = '[Service Assemblies] Fetch details';
  export class FetchDetails implements Action {
    readonly type = FetchDetailsType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const FetchDetailsErrorType =
    '[Service Assemblies] Fetch details error';
  export class FetchDetailsError implements Action {
    readonly type = FetchDetailsErrorType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const FetchDetailsSuccessType =
    '[Service Assemblies] Fetch details success';
  export class FetchDetailsSuccess implements Action {
    readonly type = FetchDetailsSuccessType;
    constructor(
      public readonly payload: {
        id: string;
        data: IServiceAssemblyBackendDetails;
      }
    ) {}
  }

  export const ChangeStateType = '[Service Assemblies] Change state';
  export class ChangeState implements Action {
    readonly type = ChangeStateType;
    constructor(
      public readonly payload: {
        id: string;
        state: ServiceAssemblyState;
      }
    ) {}
  }

  export const ChangeStateErrorType = '[Service Assemblies] Change state error';
  export class ChangeStateError implements Action {
    readonly type = ChangeStateErrorType;
    constructor(
      public readonly payload: { id: string; errorChangeState: string }
    ) {}
  }

  export const ChangeStateSuccessType =
    '[Service Assemblies] Change state success';
  export class ChangeStateSuccess implements Action {
    readonly type = ChangeStateSuccessType;
    constructor(
      public readonly payload: { id: string; state: ServiceAssemblyState }
    ) {}
  }

  export const RemovedType = '[Service Assemblies] Removed';
  export class Removed implements Action {
    readonly type = RemovedType;
    constructor(public readonly payload: IServiceAssemblyRow) {}
  }
}
