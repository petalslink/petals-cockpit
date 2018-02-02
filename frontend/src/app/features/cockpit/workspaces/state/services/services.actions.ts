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

import { JsTable } from 'app/shared/helpers/jstable.helper';
import {
  IServiceBackendDetails,
  IServiceBackendSSE,
} from 'app/shared/services/services.service';

export namespace Services {
  export const FetchAllType = '[Services] Fetch all';
  export class FetchAll implements Action {
    readonly type = FetchAllType;
    constructor() {}
  }

  export const FetchAllErrorType = '[Services] Fetch all error';
  export class FetchAllError implements Action {
    readonly type = FetchAllErrorType;
    constructor() {}
  }

  export const FetchAllSuccessType = '[Services] Fetch all success';
  export class FetchAllSuccess implements Action {
    readonly type = FetchAllSuccessType;
    constructor(public readonly payload: JsTable<IServiceBackendSSE>) {}
  }

  export const SetCurrentType = '[Services] Set Current';
  export class SetCurrent implements Action {
    readonly type = SetCurrentType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const FetchDetailsType = '[Services] Fetch details';
  export class FetchDetails implements Action {
    readonly type = FetchDetailsType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const FetchDetailsErrorType = '[Services] Fetch details error';
  export class FetchDetailsError implements Action {
    readonly type = FetchDetailsErrorType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const FetchDetailsSuccessType = '[Services] Fetch details success';
  export class FetchDetailsSuccess implements Action {
    readonly type = FetchDetailsSuccessType;
    constructor(
      public readonly payload: { id: string; data: IServiceBackendDetails }
    ) {}
  }
}
