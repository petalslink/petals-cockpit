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
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { Buses } from 'app/features/cockpit/workspaces/state/buses/buses.actions';
import { Components } from 'app/features/cockpit/workspaces/state/components/components.actions';
import { Containers } from 'app/features/cockpit/workspaces/state/containers/containers.actions';
import { ServiceAssemblies } from 'app/features/cockpit/workspaces/state/service-assemblies/service-assemblies.actions';
import { ServiceUnits } from 'app/features/cockpit/workspaces/state/service-units/service-units.actions';
import { SharedLibraries } from 'app/features/cockpit/workspaces/state/shared-libraries/shared-libraries.actions';
import { batchActions } from 'app/shared/helpers/batch-actions.helper';
import { IStore } from 'app/shared/state/store.interface';
import { Ui } from 'app/shared/state/ui.actions';
import { isSmallScreen } from 'app/shared/state/ui.selectors';

type SetCurrentActions =
  | Containers.SetCurrent
  | Components.SetCurrent
  | ServiceUnits.SetCurrent
  | ServiceAssemblies.SetCurrent
  | SharedLibraries.SetCurrent;

@Injectable()
export class UiEffects {
  constructor(private actions$: Actions, private store$: Store<IStore>) {}

  @Effect({ dispatch: true })
  closeSidenavOnSmallScreen$: Observable<Action> = this.actions$
    .ofType(Ui.CloseSidenavOnSmallScreenType)
    .withLatestFrom(this.store$.let(isSmallScreen))
    .filter(([_, ss]) => ss)
    .map(_ => new Ui.CloseSidenav());

  @Effect({ dispatch: true })
  unfoldCurrentElementParents$: Observable<Action> = this.actions$
    .ofType<SetCurrentActions>(
      Containers.SetCurrentType,
      Components.SetCurrentType,
      ServiceUnits.SetCurrentType,
      ServiceAssemblies.SetCurrentType,
      SharedLibraries.SetCurrentType
    )
    .filter(action => !!action.payload.id)
    .withLatestFrom(this.store$)
    .map(([action, state]: [SetCurrentActions, IStore]) =>
      batchActions(unfoldParents(action, state))
    );
}

function unfoldParents(action: SetCurrentActions, state: IStore) {
  return unfoldWithParents(action, state, false);
}

function unfoldWithParents(
  action: SetCurrentActions | Buses.SetCurrent,
  state: IStore,
  alsoCurrent = true
): Action[] {
  const id = action.payload.id;

  switch (action.type) {
    case Buses.SetCurrentType: {
      return alsoCurrent ? [new Buses.Unfold({ id })] : [];
    }

    case Containers.SetCurrentType: {
      return [
        ...(alsoCurrent
          ? [new Containers.Unfold({ id, type: 'container' })]
          : []),
        ...unfoldWithParents(
          new Buses.SetCurrent({ id: state.containers.byId[id].busId }),
          state
        ),
      ];
    }

    case Components.SetCurrentType: {
      const cId = state.components.byId[id].containerId;
      return [
        ...(alsoCurrent ? [new Components.Unfold({ id })] : []),
        new Containers.Unfold({ id: cId, type: 'components' }),
        ...unfoldWithParents(new Containers.SetCurrent({ id: cId }), state),
      ];
    }

    case ServiceAssemblies.SetCurrentType: {
      const cId = state.serviceAssemblies.byId[id].containerId;
      return [
        new Containers.Unfold({ id: cId, type: 'service-assemblies' }),
        ...unfoldWithParents(new Containers.SetCurrent({ id: cId }), state),
      ];
    }

    case SharedLibraries.SetCurrentType: {
      const cId = state.sharedLibraries.byId[id].containerId;
      return [
        new Containers.Unfold({ id: cId, type: 'shared-libraries' }),
        ...unfoldWithParents(new Containers.SetCurrent({ id: cId }), state),
      ];
    }

    case ServiceUnits.SetCurrentType: {
      return unfoldWithParents(
        new Components.SetCurrent({
          id: state.serviceUnits.byId[id].componentId,
        }),
        state
      );
    }
  }
}
