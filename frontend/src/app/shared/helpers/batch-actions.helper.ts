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

import { Inject, Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { Action, ActionReducer, ScannedActionsSubject } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { MergeMapOperator } from 'rxjs/operators/mergeMap';

export const BatchType = 'BATCHING_REDUCER.BATCH';
export class Batch implements Action {
  readonly type = BatchType;
  constructor(public readonly payload: Action[]) {}
}

export function batchActions(actions: Action[]): Batch {
  return new Batch(actions);
}

export function enableBatching<S>(reduce: ActionReducer<S>): ActionReducer<S> {
  return function batchingReducer(state: S, action: Action): S {
    if (action.type === BatchType) {
      return (action as Batch).payload.reduce(batchingReducer, state);
    } else {
      return reduce(state, action);
    }
  };
}

export function explodeBatchActionsOperator(keepBatchAction = true) {
  return new ExplodeBatchActionsOperator(keepBatchAction);
}

export class ExplodeBatchActionsOperator extends MergeMapOperator<
  Action,
  Action,
  Action
> {
  constructor(keepBatchAction: boolean) {
    super(action => {
      if (action.type === BatchType) {
        const batch = action as Batch;
        return Observable.from(
          keepBatchAction ? [batch, ...batch.payload] : batch.payload
        );
      } else {
        return Observable.of(action);
      }
    });
  }
}

@Injectable()
export class ActionsWithBatched extends Actions<Action> {
  constructor(@Inject(ScannedActionsSubject) source?: Observable<Action>) {
    super(source);
    this.operator = explodeBatchActionsOperator();
  }
}
