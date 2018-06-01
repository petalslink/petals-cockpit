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

import { JsTable } from '@shared/helpers/jstable.helper';
import { ICorrelationId } from '@shared/interfaces/correlation-id.interface';
import { IComponentBackendSSE } from '@shared/services/components.service';
import {
  IContainerBackendDetails,
  IContainerBackendSSE,
} from '@shared/services/containers.service';
import { IServiceAssemblyBackendSSE } from '@shared/services/service-assemblies.service';
import { ISharedLibraryBackendSSE } from '@shared/services/shared-libraries.service';
import { ISharedLibrarySimplified } from '@wks/state/shared-libraries/shared-libraries.interface';

export namespace Containers {
  export const FetchedType = '[Containers] Fetched';
  export class Fetched implements Action {
    readonly type = FetchedType;
    constructor(public readonly payload: JsTable<IContainerBackendSSE>) {}
  }

  export const AddedType = '[Containers] Added';
  export class Added implements Action {
    readonly type = AddedType;
    constructor(public readonly payload: JsTable<IContainerBackendSSE>) {}
  }

  export const SetCurrentType = '[Containers] Set Current';
  export class SetCurrent implements Action {
    readonly type = SetCurrentType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const FetchDetailsType = '[Containers] Fetch details';
  export class FetchDetails implements Action {
    readonly type = FetchDetailsType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const FetchDetailsErrorType = '[Containers] Fetch details error';
  export class FetchDetailsError implements Action {
    readonly type = FetchDetailsErrorType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const FetchDetailsSuccessType = '[Containers] Fetch details success';
  export class FetchDetailsSuccess implements Action {
    readonly type = FetchDetailsSuccessType;
    constructor(
      public readonly payload: {
        id: string;
        data: IContainerBackendDetails;
      }
    ) {}
  }

  export interface FoldPayload {
    id: string;
    type:
      | 'container'
      | 'components'
      | 'service-assemblies'
      | 'shared-libraries';
  }

  export const FoldType = '[Containers] Fold';
  export class Fold implements Action {
    readonly type = FoldType;
    constructor(public readonly payload: FoldPayload) {}
  }

  export const UnfoldType = '[Containers] Unfold';
  export class Unfold implements Action {
    readonly type = UnfoldType;
    constructor(public readonly payload: FoldPayload) {}
  }

  export const ToggleFoldType = '[Containers] Toggle fold';
  export class ToggleFold implements Action {
    readonly type = ToggleFoldType;
    constructor(public readonly payload: FoldPayload) {}
  }

  export const DeployServiceAssemblyType =
    '[Containers] Deploy service assembly';
  export class DeployServiceAssembly implements Action {
    readonly type = DeployServiceAssemblyType;
    constructor(
      public readonly payload: {
        id: string;
        file: File;
        name: string;
      } & ICorrelationId
    ) {}
  }

  export const DeployServiceAssemblyErrorType =
    '[Containers] Deploy service assembly error';
  export class DeployServiceAssemblyError implements Action {
    readonly type = DeployServiceAssemblyErrorType;
    constructor(
      public readonly payload: {
        id: string;
        errorDeployment: string;
      } & ICorrelationId
    ) {}
  }

  export const DeployServiceAssemblySuccessType =
    '[Containers] Deploy service assembly success';
  export class DeployServiceAssemblySuccess implements Action {
    readonly type = DeployServiceAssemblySuccessType;
    constructor(
      public readonly payload: IServiceAssemblyBackendSSE & ICorrelationId
    ) {}
  }

  export const DeploySharedLibraryType = '[Containers] Deploy shared library';
  export class DeploySharedLibrary implements Action {
    readonly type = DeploySharedLibraryType;
    constructor(
      public readonly payload: {
        id: string;
        file: File;
        name: string;
        version: string;
      } & ICorrelationId
    ) {}
  }

  export const DeploySharedLibraryErrorType =
    '[Containers] Deploy shared library error';
  export class DeploySharedLibraryError implements Action {
    readonly type = DeploySharedLibraryErrorType;
    constructor(
      public readonly payload: {
        id: string;
        errorDeployment: string;
      } & ICorrelationId
    ) {}
  }

  export const DeploySharedLibrarySuccessType =
    '[Containers] Deploy shared library success';
  export class DeploySharedLibrarySuccess implements Action {
    readonly type = DeploySharedLibrarySuccessType;
    constructor(
      public readonly payload: ISharedLibraryBackendSSE & ICorrelationId
    ) {}
  }

  export const DeployComponentType = '[Containers] Deploy component';
  export class DeployComponent implements Action {
    readonly type = DeployComponentType;
    constructor(
      public readonly payload: {
        id: string;
        file: File;
        name: string;
        sharedLibraries: ISharedLibrarySimplified[];
      } & ICorrelationId
    ) {}
  }

  export const DeployComponentErrorType = '[Containers] Deploy component error';
  export class DeployComponentError implements Action {
    readonly type = DeployComponentErrorType;
    constructor(
      public readonly payload: {
        id: string;
        errorDeployment: string;
      } & ICorrelationId
    ) {}
  }

  export const DeployComponentSuccessType =
    '[Containers] Deploy component success';
  export class DeployComponentSuccess implements Action {
    readonly type = DeployComponentSuccessType;
    constructor(
      public readonly payload: IComponentBackendSSE & ICorrelationId
    ) {}
  }
}
