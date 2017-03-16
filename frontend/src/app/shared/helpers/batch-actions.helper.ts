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

import { Injectable, Inject } from '@angular/core';
import { Action, Dispatcher, ActionReducer } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { MergeMapOperator } from 'rxjs/operator/mergeMap';
import { Actions } from '@ngrx/effects';

export const BATCH = 'BATCHING_REDUCER.BATCH';

export interface BatchAction extends Action {
  payload: Action[];
}

export function batchActions(actions: Action[]): BatchAction {
  return { type: BATCH, payload: actions };
}

export function enableBatching<S>(reduce: ActionReducer<S>): ActionReducer<S> {
  return function batchingReducer(state, action) {
    if (action.type === BATCH) {
      return action.payload.reduce(batchingReducer, state);
    } else {
      return reduce(state, action);
    }
  };
}

export function explodeBatchActionsOperator(keepBatchAction = true) {
   return new ExplodeBatchActionsOperator(keepBatchAction);
}

export class ExplodeBatchActionsOperator extends MergeMapOperator<any, Action, Action> {
  constructor(keepBatchAction: boolean) {
    super((action: Action) =>
      action.type === BATCH
        ? Observable.from(keepBatchAction ? [action, ...action.payload] : action.payload)
        : Observable.of(action)
    );
  }
}

@Injectable()
export class ActionsWithBatched extends Actions {
  constructor( @Inject(Dispatcher) actionsSubject: Observable<Action>) {
    super(actionsSubject);
    this.operator = explodeBatchActionsOperator();
  }
}
