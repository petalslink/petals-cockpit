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

import { Action } from '@ngrx/store';

import { IComponentRow } from 'app/features/cockpit/workspaces/state/components/components.interface';
import { JsTable } from 'app/shared/helpers/jstable.helper';
import {
  ComponentState,
  IComponentBackendDetails,
  IComponentBackendSSE,
} from 'app/shared/services/components.service';
import { IServiceUnitBackendSSE } from 'app/shared/services/service-units.service';

export namespace Components {
  export const FetchedType = '[Components] Fetched';
  export class Fetched implements Action {
    readonly type = FetchedType;
    constructor(public readonly payload: JsTable<IComponentBackendSSE>) {}
  }

  export const AddedType = '[Components] Added';
  export class Added implements Action {
    readonly type = AddedType;
    constructor(public readonly payload: JsTable<IComponentBackendSSE>) {}
  }

  export const SetCurrentType = '[Components] Set Current';
  export class SetCurrent implements Action {
    readonly type = SetCurrentType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const FetchDetailsType = '[Components] Fetch details';
  export class FetchDetails implements Action {
    readonly type = FetchDetailsType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const FetchDetailsErrorType = '[Components] Fetch details error';
  export class FetchDetailsError implements Action {
    readonly type = FetchDetailsErrorType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const FetchDetailsSuccessType = '[Components] Fetch details success';
  export class FetchDetailsSuccess implements Action {
    readonly type = FetchDetailsSuccessType;
    constructor(
      public readonly payload: {
        id: string;
        data: IComponentBackendDetails;
      }
    ) {}
  }

  export const FoldType = '[Components] Fold';
  export class Fold implements Action {
    readonly type = FoldType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const UnfoldType = '[Components] Unfold';
  export class Unfold implements Action {
    readonly type = UnfoldType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const ToggleFoldType = '[Components] Toggle fold';
  export class ToggleFold implements Action {
    readonly type = ToggleFoldType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const ChangeStateType = '[Components] Change state';
  export class ChangeState implements Action {
    readonly type = ChangeStateType;
    constructor(
      public readonly payload: {
        id: string;
        state: ComponentState;
        parameters: { [key: string]: string };
      }
    ) {}
  }

  export const ChangeStateErrorType = '[Components] Change state error';
  export class ChangeStateError implements Action {
    readonly type = ChangeStateErrorType;
    constructor(
      public readonly payload: { id: string; errorChangeState: string }
    ) {}
  }

  export const ChangeStateSuccessType = '[Components] Change state success';
  export class ChangeStateSuccess implements Action {
    readonly type = ChangeStateSuccessType;
    constructor(
      public readonly payload: { id: string; state: ComponentState }
    ) {}
  }

  export const RemovedType = '[Components] Removed';
  export class Removed implements Action {
    readonly type = RemovedType;
    constructor(public readonly payload: IComponentRow) {}
  }

  export const DeployServiceUnitType = '[Components] Deploy service unit';
  export class DeployServiceUnit implements Action {
    readonly type = DeployServiceUnitType;
    constructor(
      public readonly payload: {
        id: string;
        file: File;
        serviceUnitName: string;
        correlationId: string;
      }
    ) {}
  }

  export const DeployServiceUnitErrorType =
    '[Components] Deploy service unit error';
  export class DeployServiceUnitError implements Action {
    readonly type = DeployServiceUnitErrorType;
    constructor(
      public readonly payload: { id: string; errorDeployment: string }
    ) {}
  }

  export const DeployServiceUnitSuccessType =
    '[Components] Deploy service unit success';
  export class DeployServiceUnitSuccess implements Action {
    readonly type = DeployServiceUnitSuccessType;
    constructor(
      public readonly payload: IServiceUnitBackendSSE & {
        correlationId: string;
      }
    ) {}
  }
}
