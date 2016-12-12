/**
 * Copyright (C) 2016 Linagora
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

// ngrx
import { Action, ActionReducer, Store } from '@ngrx/store';

// immutable
import { fromJS, List, Map } from 'immutable';

// rxjs
import { Observable } from 'rxjs';

// our interfaces
import { IStore } from '../interfaces/store.interface';
import { IWorkspaceRecord } from '../interfaces/workspace.interface';
import { IContainerRecord, IBusRecord, IComponentRecord, IServiceUnitRecord } from './../interfaces/petals.interface';

// our states
import { workspaceRecordFactory } from './workspace.state';

// our helpers
import { escapeStringRegexp } from '../helpers/helper';

// our actions
import { UserActions } from './user.actions';
import { WorkspaceActions } from './workspace.actions';

function createWorkspaceReducer(workspaceR: IWorkspaceRecord = workspaceRecordFactory(), action: Action) {
  /* FETCH_WORKSPACE* */
  if (action.type === WorkspaceActions.FETCH_WORKSPACE) {
    return workspaceR.set('fetchingWorkspace', true);
  }

  else if (action.type === WorkspaceActions.FETCH_WORKSPACE_FAILED) {
    return workspaceR.set('fetchingWorkspace', false);
  }

  else if (action.type === WorkspaceActions.FETCH_WORKSPACE_SUCCESS) {
    // payload.data contains :
    // -----------------------
    // payload: {
    //   id: action.payload,
    //   data: {
    //     busesInProgress: [...],
    //     buses: [...]
    //   }
    // }

    let newWorkspaceR = workspaceR;

    // if we changed from workspace A to B
    // (not a refresh from A to A updated)
    // clear petals search
    if (workspaceR.get('id') !== action.payload.id) {
      newWorkspaceR = workspaceR.set('searchPetals', '');
    }

    return newWorkspaceR
      .merge({
        id: action.payload.id,
        fetchingWorkspace: false,
        name: action.payload.data.name,
        buses: action.payload.data.buses,
        busesInProgress: action.payload.data.busesInProgress
      });
  }

  /* RESET_WORKSPACE */
  else if (action.type === WorkspaceActions.RESET_WORKSPACE) {
    return workspaceRecordFactory();
  }

  /* EDIT_PETALS_SEARCH */
  else if (action.type === WorkspaceActions.EDIT_PETALS_SEARCH) {
    return workspaceR.set('searchPetals', action.payload);
  }

  /* DELETE_PETALS_SEARCH */
  else if (action.type === WorkspaceActions.DELETE_PETALS_SEARCH) {
    return workspaceR.set('searchPetals', '');
  }

  /* IMPORT_BUS* */
  else if (action.type === WorkspaceActions.IMPORT_BUS) {
    return workspaceR.set('importingBus', true);
  }

  else if (action.type === WorkspaceActions.IMPORT_BUS_SUCCESS) {
    // once the bus is imported, move it from workspaces
    // but not here as it's been done in an async way using sse
    // CF ADD_BUS_SUCCESS
    return workspaceR.set('importingBus', false);
  }

  else if (action.type === WorkspaceActions.IMPORT_BUS_FAILED) {
    return workspaceR.set('importingBus', false);
  }

  /* IMPORT_BUS_MINIMAL_CONFIG */
  else if (action.type === WorkspaceActions.IMPORT_BUS_MINIMAL_CONFIG) {
    return workspaceR
      .merge({
        importingBus: false,
        // TODO factor with the equivalent code in workspace.effects.ts!!
        busesInProgress: workspaceR.get('busesInProgress').push(fromJS({
          id: action.payload.id,
          config: {
            ip: action.payload.importIp,
            // even if the server send a number, we should also accept a string
            port: parseInt(`${action.payload.importPort}`, 10),
            login: action.payload.importUsername,
            password: action.payload.password,
            passphrase: action.payload.passphrase
          }
        }))
      });
  }

  /* ADD_BUS* */
  else if (action.type === WorkspaceActions.ADD_BUS_SUCCESS) {
    return workspaceR
      .merge({
        buses: workspaceR.get('buses').push(fromJS(action.payload)),
        busesInProgress: workspaceR.get('busesInProgress').filter((busInP: IWorkspaceRecord) => busInP.get('id') !== action.payload.id)
      });
  }

  else if (action.type === WorkspaceActions.ADD_BUS_FAILED) {
    let busIndex = workspaceR
      .get('busesInProgress')
      .findIndex((buses: IBusRecord) => buses.get('id') === action.payload.id);

    if (busIndex === -1) {
      return workspaceR;
    }

    return workspaceR
      .setIn(['busesInProgress', busIndex],
      workspaceR
        .getIn(['busesInProgress', busIndex])
        .set('importError', action.payload.importError)
      );
  }

  /* REMOVE_BUS* */
  else if (action.type === WorkspaceActions.REMOVE_BUS || action.type === WorkspaceActions.REMOVE_BUS_FAILED) {
    let busIndex = workspaceR
      .get('busesInProgress')
      .findIndex((buses: IBusRecord) => buses.get('id') === action.payload);

    if (busIndex === -1) {
      return workspaceR;
    }

    return workspaceR.setIn(['busesInProgress', busIndex, 'removing'], action.type === WorkspaceActions.REMOVE_BUS);
  }

  else if (action.type === WorkspaceActions.REMOVE_BUS_SUCCESS) {
    return workspaceR.set('busesInProgress',
      workspaceR
        .get('busesInProgress')
        .filter((buses: IBusRecord) => buses.get('id') !== action.payload.idBus)
    );
  }

  /* FETCH_BUS_DETAILS* */
  else if (action.type === WorkspaceActions.FETCH_BUS_DETAILS) {
    let busIndex = workspaceR
      .get('buses')
      .findIndex((buses: IBusRecord) => buses.get('id') === action.payload.idBus);

    if (busIndex === -1) {
      return workspaceR;
    }

    return workspaceR.setIn(['buses', busIndex, 'isFetchingDetails'], true);
  }

  else if (action.type === WorkspaceActions.FETCH_BUS_DETAILS_SUCCESS) {
    let busIndex = workspaceR
      .get('buses')
      // here we use action.payload.id instead of idBus because
      // the payload's coming from the server
      .findIndex((buses: IBusRecord) => buses.get('id') === action.payload.id);

    if (busIndex === -1) {
      return workspaceR;
    }

    return workspaceR.setIn(['buses', busIndex],
      workspaceR
        .getIn(['buses', busIndex])
        .merge(
        fromJS({ isFetchingDetails: false }),
        fromJS(action.payload)
        )
    );
  }

  else if (action.type === WorkspaceActions.FETCH_BUS_DETAILS_FAILED) {
    let busIndex = workspaceR
      .get('buses')
      .findIndex((buses: IBusRecord) => buses.get('id') === action.payload.idBus);

    if (busIndex === -1) {
      return workspaceR;
    }

    return workspaceR.setIn(['buses', busIndex, 'isFetchingDetails'], false);
  }

  /* FETCH_CONTAINER_DETAILS* */
  else if (action.type === WorkspaceActions.FETCH_CONTAINER_DETAILS) {
    let busIndex = workspaceR
      .get('buses')
      .findIndex((bus: IBusRecord) => bus.get('id') === action.payload.idBus);

    if (busIndex === -1 || typeof workspaceR.getIn(['buses', busIndex, 'containers']) === 'undefined') {
      return workspaceR;
    }

    let containerIndex = workspaceR
      .getIn(['buses', busIndex, 'containers'])
      .findIndex((container: IContainerRecord) => container.get('id') === action.payload.idContainer);

    if (containerIndex === -1) {
      return workspaceR;
    }

    return workspaceR.setIn(['buses', busIndex, 'containers', containerIndex, 'isFetchingDetails'], true);
  }

  else if (action.type === WorkspaceActions.FETCH_CONTAINER_DETAILS_SUCCESS) {
    let busIndex = workspaceR
      .get('buses')
      // here we use action.payload.id instead of idBus because
      // the payload's coming from the server
      .findIndex((buses: IBusRecord) => buses.get('id') === action.payload.bus.id);

    if (busIndex === -1) {
      return workspaceR;
    }

    let containerIndex = workspaceR
      .getIn(['buses', busIndex, 'containers'])
      // here we use action.payload.id instead of idBus because
      // the payload's coming from the server
      .findIndex((containers: IContainerRecord) => containers.get('id') === action.payload.bus.container.id);

    if (containerIndex === -1) {
      return workspaceR;
    }

    return workspaceR.setIn(['buses', busIndex, 'containers', containerIndex],
      workspaceR
        .getIn(['buses', busIndex, 'containers', containerIndex])
        .merge(
          fromJS({ isFetchingDetails: false }),
          fromJS(action.payload.bus.container)
        )
    );
  }

  else if (action.type === WorkspaceActions.FETCH_CONTAINER_DETAILS_FAILED) {
    let busIndex = workspaceR
      .get('buses')
      .findIndex((buses: IBusRecord) => buses.get('id') === action.payload.idBus);

    if (busIndex === -1) {
      return workspaceR;
    }

    let containerIndex = workspaceR
      .getIn(['buses', busIndex, 'containers'])
      .findIndex((containers: IContainerRecord) => containers.get('id') === action.payload.idContainer);

    if (containerIndex === -1) {
      return workspaceR;
    }

    return workspaceR.setIn(['buses', busIndex, 'containers', containerIndex, 'isFetchingDetails'], false);
  }

  /* FETCH_COMPONENT_DETAILS* */
  else if (action.type === WorkspaceActions.FETCH_COMPONENT_DETAILS) {
    let busIndex = workspaceR
      .get('buses')
      .findIndex((bus: IBusRecord) => bus.get('id') === action.payload.idBus);

    if (busIndex === -1 || typeof workspaceR.getIn(['buses', busIndex, 'containers']) === 'undefined') {
      return workspaceR;
    }

    let containerIndex = workspaceR
      .getIn(['buses', busIndex, 'containers'])
      .findIndex((container: IContainerRecord) => container.get('id') === action.payload.idContainer);

    if (containerIndex === -1) {
      return workspaceR;
    }

    let componentIndex = workspaceR
      .getIn(['buses', busIndex, 'containers', containerIndex, 'components'])
      .findIndex((component: IComponentRecord) => component.get('id') === action.payload.idComponent);

    if (componentIndex === -1) {
      return workspaceR;
    }

    return workspaceR.setIn(['buses', busIndex, 'containers', containerIndex, 'components', componentIndex, 'isFetchingDetails'], true);
  }

  else if (action.type === WorkspaceActions.FETCH_COMPONENT_DETAILS_SUCCESS) {
    let busIndex = workspaceR
      .get('buses')
      // here we use action.payload.id instead of idBus because
      // the payload's coming from the server
      .findIndex((buses: IBusRecord) => buses.get('id') === action.payload.bus.id);

    if (busIndex === -1) {
      return workspaceR;
    }

    let containerIndex = workspaceR
      .getIn(['buses', busIndex, 'containers'])
      // here we use action.payload.id instead of idBus because
      // the payload's coming from the server
      .findIndex((containers: IContainerRecord) => containers.get('id') === action.payload.bus.container.id);

    if (containerIndex === -1) {
      return workspaceR;
    }

    let componentIndex = workspaceR
      .getIn(['buses', busIndex, 'containers', containerIndex, 'components'])
      // here we use action.payload.id instead of idBus because
      // the payload's coming from the server
      .findIndex((component: IComponentRecord) => component.get('id') === action.payload.bus.container.component.id);

    if (componentIndex === -1) {
      return workspaceR;
    }

    return workspaceR.setIn(['buses', busIndex, 'containers', containerIndex, 'components', componentIndex],
      workspaceR
        .getIn(['buses', busIndex, 'containers', containerIndex, 'components', componentIndex])
        .merge(
          fromJS({ isFetchingDetails: false }),
          fromJS(action.payload.bus.container.component)
        )
    );
  }

  else if (action.type === WorkspaceActions.FETCH_COMPONENT_DETAILS_FAILED) {
    let busIndex = workspaceR
      .get('buses')
      .findIndex((bus: IBusRecord) => bus.get('id') === action.payload.idBus);

    if (busIndex === -1 || typeof workspaceR.getIn(['buses', busIndex, 'containers']) === 'undefined') {
      return workspaceR;
    }

    let containerIndex = workspaceR
      .getIn(['buses', busIndex, 'containers'])
      .findIndex((container: IContainerRecord) => container.get('id') === action.payload.idContainer);

    if (containerIndex === -1) {
      return workspaceR;
    }

    let componentIndex = workspaceR
      .getIn(['buses', busIndex, 'containers', containerIndex, 'components'])
      .findIndex((component: IComponentRecord) => component.get('id') === action.payload.idComponent);

    if (componentIndex === -1) {
      return workspaceR;
    }

    return workspaceR.setIn(['buses', busIndex, 'containers', containerIndex, 'components', componentIndex, 'isFetchingDetails'], false);
  }

  /* FETCH_SU_DETAILS* */
  else if (action.type === WorkspaceActions.FETCH_SU_DETAILS) {
    let busIndex = workspaceR
      .get('buses')
      .findIndex((bus: IBusRecord) => bus.get('id') === action.payload.idBus);

    if (busIndex === -1 || typeof workspaceR.getIn(['buses', busIndex, 'containers']) === 'undefined') {
      return workspaceR;
    }

    let containerIndex = workspaceR
      .getIn(['buses', busIndex, 'containers'])
      .findIndex((container: IContainerRecord) => container.get('id') === action.payload.idContainer);

    if (containerIndex === -1) {
      return workspaceR;
    }

    let componentIndex = workspaceR
      .getIn(['buses', busIndex, 'containers', containerIndex, 'components'])
      .findIndex((component: IComponentRecord) => component.get('id') === action.payload.idComponent);

    if (componentIndex === -1) {
      return workspaceR;
    }

    let suIndex = workspaceR
      .getIn(['buses', busIndex, 'containers', containerIndex, 'components', componentIndex, 'serviceUnits'])
      .findIndex((su: IServiceUnitRecord) => su.get('id') === action.payload.idServiceUnit);

    if (suIndex === -1) {
      return workspaceR;
    }

    return workspaceR.setIn([
      'buses', busIndex,
      'containers', containerIndex,
      'components', componentIndex,
      'serviceUnits', suIndex,
      'isFetchingDetails'], true
    );
  }

  else if (action.type === WorkspaceActions.FETCH_SU_DETAILS_SUCCESS) {
    let busIndex = workspaceR
      .get('buses')
      // here we use action.payload.id instead of idBus because
      // the payload's coming from the server
      .findIndex((buses: IBusRecord) => buses.get('id') === action.payload.bus.id);

    if (busIndex === -1) {
      return workspaceR;
    }

    let containerIndex = workspaceR
      .getIn(['buses', busIndex, 'containers'])
      // here we use action.payload.id instead of idBus because
      // the payload's coming from the server
      .findIndex((containers: IContainerRecord) => containers.get('id') === action.payload.bus.container.id);

    if (containerIndex === -1) {
      return workspaceR;
    }

    let componentIndex = workspaceR
      .getIn(['buses', busIndex, 'containers', containerIndex, 'components'])
      // here we use action.payload.id instead of idBus because
      // the payload's coming from the server
      .findIndex((component: IComponentRecord) => component.get('id') === action.payload.bus.container.component.id);

    if (componentIndex === -1) {
      return workspaceR;
    }

    let suIndex = workspaceR
      .getIn(['buses', busIndex, 'containers', containerIndex, 'components', componentIndex, 'serviceUnits'])
      .findIndex((su: IServiceUnitRecord) => su.get('id') === action.payload.bus.container.component.serviceUnit.id);

    if (suIndex === -1) {
      return workspaceR;
    }

    return workspaceR.setIn(['buses', busIndex, 'containers', containerIndex, 'components', componentIndex, 'serviceUnits', suIndex],
      workspaceR
        .getIn([
          'buses', busIndex,
          'containers', containerIndex,
          'components', componentIndex,
          'serviceUnits', suIndex
        ])
        .merge(
          fromJS({ isFetchingDetails: false }),
          fromJS(action.payload.bus.container.component.serviceUnit)
        )
    );
  }

  else if (action.type === WorkspaceActions.FETCH_SU_DETAILS_FAILED) {
    let busIndex = workspaceR
      .get('buses')
      .findIndex((bus: IBusRecord) => bus.get('id') === action.payload.idBus);

    if (busIndex === -1 || typeof workspaceR.getIn(['buses', busIndex, 'containers']) === 'undefined') {
      return workspaceR;
    }

    let containerIndex = workspaceR
      .getIn(['buses', busIndex, 'containers'])
      .findIndex((container: IContainerRecord) => container.get('id') === action.payload.idContainer);

    if (containerIndex === -1) {
      return workspaceR;
    }

    let componentIndex = workspaceR
      .getIn(['buses', busIndex, 'containers', containerIndex, 'components'])
      .findIndex((component: IComponentRecord) => component.get('id') === action.payload.idComponent);

    if (componentIndex === -1) {
      return workspaceR;
    }

    let suIndex = workspaceR
      .getIn(['buses', busIndex, 'containers', containerIndex, 'components', componentIndex, 'serviceUnits'])
      .findIndex((su: IServiceUnitRecord) => su.get('id') === action.payload.idServiceUnit);

    if (suIndex === -1) {
      return workspaceR;
    }

    return workspaceR.setIn([
      'buses', busIndex,
      'containers', containerIndex,
      'components', componentIndex,
      'serviceUnits', suIndex,
      'isFetchingDetails'], false
    );
  }

  /* FETCH_BUS_CONFIG* */
  else if (action.type === WorkspaceActions.FETCH_BUS_CONFIG) {
    return workspaceR.set('gettingBusConfig', true);
  }

  else if (action.type === WorkspaceActions.FETCH_BUS_CONFIG_SUCCESS) {
    let busIndex = workspaceR
      .get('buses')
      .findIndex((buses: IBusRecord) => buses.get('id') === action.payload.idBus);

    if (busIndex === -1) {
      return workspaceR;
    }

    return workspaceR
      .merge({
        gettingBusConfig: false,
        buses: workspaceR.setIn(['buses', busIndex, 'config'], fromJS(action.payload.config))
      });
  }

  else if (action.type === WorkspaceActions.FETCH_BUS_CONFIG_FAILED) {
    return workspaceR.set('gettingBusConfig', false);
  }

  /* SET_ID_BUS_CONTAINER_COMPONENT_SERVICE_UNIT */
  else if (action.type === WorkspaceActions.SET_ID_BUS_CONTAINER_COMPONENT_SERVICE_UNIT) {
    return workspaceR
      .merge({
        selectedBusId: action.payload.selectedBusId,
        selectedContainerId: action.payload.selectedContainerId,
        selectedComponentId: action.payload.selectedComponentId,
        selectedServiceUnitId: action.payload.selectedServiceUnitId
      });
  }

  /* (UN)FOLD_BUS */
  else if (action.type === WorkspaceActions.FOLD_BUS) {
    let busIndex = workspaceR
      .get('buses')
      .findIndex((buses: IBusRecord) => buses.get('id') === action.payload.idBus);

    if (busIndex === -1) {
      return workspaceR;
    }

    return workspaceR.setIn(['buses', busIndex, 'isFolded'], true);
  }

  else if (action.type === WorkspaceActions.UNFOLD_BUS) {
    let busIndex = workspaceR
      .get('buses')
      .findIndex((buses: IBusRecord) => buses.get('id') === action.payload.idBus);

    if (busIndex === -1) {
      return workspaceR;
    }

    return workspaceR.setIn(['buses', busIndex, 'isFolded'], false);
  }

  else if (action.type === WorkspaceActions.TOGGLE_FOLD_BUS) {
    let busIndex = workspaceR
      .get('buses')
      .findIndex((buses: IBusRecord) => buses.get('id') === action.payload.idBus);

    if (busIndex === -1) {
      return workspaceR;
    }

    return workspaceR.setIn(
      ['buses', busIndex, 'isFolded'],
      !workspaceR.getIn(['buses', busIndex, 'isFolded'])
    );
  }

  /* (UN)FOLD_CONTAINER */
  else if (action.type === WorkspaceActions.FOLD_CONTAINER) {
    let busIndex = workspaceR
      .get('buses')
      .findIndex((buses: IBusRecord) => buses.get('id') === action.payload.idBus);

    if (busIndex === -1) {
      return workspaceR;
    }

    let containerIndex = workspaceR
      .getIn(['buses', busIndex, 'containers'])
      .findIndex((containers: IContainerRecord) => containers.get('id') === action.payload.idContainer);

    if (containerIndex === -1) {
      return workspaceR;
    }

    return workspaceR.setIn(['buses', busIndex, 'containers', containerIndex, 'isFolded'], true);
  }

  else if (action.type === WorkspaceActions.UNFOLD_CONTAINER) {
    let busIndex = workspaceR
      .get('buses')
      .findIndex((buses: IBusRecord) => buses.get('id') === action.payload.idBus);

    if (busIndex === -1) {
      return workspaceR;
    }

    let containerIndex = workspaceR
      .getIn(['buses', busIndex, 'containers'])
      .findIndex((containers: IContainerRecord) => containers.get('id') === action.payload.idContainer);

    if (containerIndex === -1) {
      return workspaceR;
    }

    return workspaceR.setIn(['buses', busIndex, 'containers', containerIndex, 'isFolded'], false);
  }

  else if (action.type === WorkspaceActions.TOGGLE_FOLD_CONTAINER) {
    let busIndex = workspaceR
      .get('buses')
      .findIndex((buses: IBusRecord) => buses.get('id') === action.payload.idBus);

    if (busIndex === -1) {
      return workspaceR;
    }

    let containerIndex = workspaceR
      .getIn(['buses', busIndex, 'containers'])
      .findIndex((containers: IContainerRecord) => containers.get('id') === action.payload.idContainer);

    if (containerIndex === -1) {
      return workspaceR;
    }

    return workspaceR.setIn(
      ['buses', busIndex, 'containers', containerIndex, 'isFolded'],
      !workspaceR.getIn(['buses', busIndex, 'containers', containerIndex, 'isFolded'])
    );
  }

  /* (UN)FOLD_COMPONENT */
  else if (action.type === WorkspaceActions.FOLD_COMPONENT) {
    let busIndex = workspaceR
      .get('buses')
      .findIndex((buses: IBusRecord) => buses.get('id') === action.payload.idBus);

    if (busIndex === -1) {
      return workspaceR;
    }

    let containerIndex = workspaceR
      .getIn(['buses', busIndex, 'containers'])
      .findIndex((containers: IContainerRecord) => containers.get('id') === action.payload.idContainer);

    if (containerIndex === -1) {
      return workspaceR;
    }

    let componentIndex = workspaceR
      .getIn(['buses', busIndex, 'containers', containerIndex, 'components'])
      .findIndex((components: IComponentRecord) => components.get('id') === action.payload.idComponent);

    if (componentIndex === -1) {
      return workspaceR;
    }

    return workspaceR.setIn(['buses', busIndex, 'containers', containerIndex, 'components', componentIndex, 'isFolded'], true);
  }

  else if (action.type === WorkspaceActions.UNFOLD_COMPONENT) {
    let busIndex = workspaceR
      .get('buses')
      .findIndex((buses: IBusRecord) => buses.get('id') === action.payload.idBus);

    if (busIndex === -1) {
      return workspaceR;
    }

    let containerIndex = workspaceR
      .getIn(['buses', busIndex, 'containers'])
      .findIndex((containers: IContainerRecord) => containers.get('id') === action.payload.idContainer);

    if (containerIndex === -1) {
      return workspaceR;
    }

    let componentIndex = workspaceR
      .getIn(['buses', busIndex, 'containers', containerIndex, 'components'])
      .findIndex((components: IComponentRecord) => components.get('id') === action.payload.idComponent);

    if (componentIndex === -1) {
      return workspaceR;
    }

    return workspaceR.setIn(['buses', busIndex, 'containers', containerIndex, 'components', componentIndex, 'isFolded'], false);
  }

  else if (action.type === WorkspaceActions.TOGGLE_FOLD_COMPONENT) {
    let busIndex = workspaceR
      .get('buses')
      .findIndex((buses: IBusRecord) => buses.get('id') === action.payload.idBus);

    if (busIndex === -1) {
      return workspaceR;
    }

    let containerIndex = workspaceR
      .getIn(['buses', busIndex, 'containers'])
      .findIndex((containers: IContainerRecord) => containers.get('id') === action.payload.idContainer);

    if (containerIndex === -1) {
      return workspaceR;
    }

    let componentIndex = workspaceR
      .getIn(['buses', busIndex, 'containers', containerIndex, 'components'])
      .findIndex((components: IComponentRecord) => components.get('id') === action.payload.idComponent);

    if (componentIndex === -1) {
      return workspaceR;
    }

    return workspaceR.setIn(
      ['buses', busIndex, 'containers', containerIndex, 'components', componentIndex, 'isFolded'],
      !workspaceR.getIn(['buses', busIndex, 'containers', containerIndex, 'components', componentIndex, 'isFolded'])
    );
  }

  else if (action.type === UserActions.USR_IS_DISCONNECTED) {
    return workspaceRecordFactory();
  }

  return workspaceR;
};

export const WorkspaceReducer: ActionReducer<IWorkspaceRecord> = createWorkspaceReducer;

// ------------
//   selector
// ------------
function filterElement(filter: String, e: Map<any, any>): Map<any, any> {
  if (e.get('name').toLowerCase().trim().match(filter.toLowerCase().trim())) {
    return e;
  } else {
    let es = elements(e)
      .map(el => filterElement(filter, el))
      .filterNot(el => (el == null))
      .toList();

    if (es.isEmpty()) {
      return null;
    } else {
      return copy(e, es);
    }
  }
}

function copy(e: Map<any, any>, es: List<any>): Map<any, any> {
  if (e.has('containers')) {
    return e.set('containers', es);
  } else if (e.has('components')) {
    return e.set('components', es);
  } else if (e.has('serviceUnits')) {
    return e.set('serviceUnits', es);
  }
}

function elements(e: Map<any, any>): List<any> {
  if (e.has('containers')) {
    return e.get('containers');
  } else if (e.has('components')) {
    return e.get('components');
  } else if (e.has('serviceUnits')) {
    return e.get('serviceUnits');
  } else {
    return List();
  }
}

export function getSearchedWorkspace() {
  return (store$: Store<IStore>): Observable<IWorkspaceRecord> => {
    return store$
      .select('workspace')
      .map((workspaceR: IWorkspaceRecord) => {
        let searchPetals: string = workspaceR.get('searchPetals');

        if (typeof searchPetals === 'undefined' || searchPetals.trim() === '') {
          return workspaceR;
        }

        searchPetals = escapeStringRegexp(searchPetals);

        let nb = workspaceR
          .get('buses')
          .map(e => filterElement(searchPetals, e))
          .filterNot(e => (e === null))
          .toList();

        return workspaceR.set('buses', nb);
      });
  };
};

export function getCurrentContainer() {
  return (store$: Store<IStore>): Observable<IContainerRecord> => {
    return store$.let(getContainerById());
  };
};

export function getContainerById(idContainer?: string) {
  return (store$: Store<IStore>): Observable<IContainerRecord> => {
    return store$
      .select('workspace')
      .filter((workspaceR: IWorkspaceRecord) => workspaceR.get('selectedBusId') !== null)
      .filter((workspaceR: IWorkspaceRecord) => {
        let selectedBusId = workspaceR.get('selectedBusId');

        let busIndex = workspaceR
          .get('buses')
          .findIndex((buses: IBusRecord) => buses.get('id') === selectedBusId);


        return busIndex !== -1;
      })
      .map((workspaceR: IWorkspaceRecord) => {
        if (typeof idContainer === 'undefined' || idContainer === null) {
          let selectedContainerId = workspaceR.get('selectedContainerId');
          return [workspaceR, selectedContainerId];
        }

        return [workspaceR, idContainer];
      })
      /* tslint:disable:no-unused-variable */
      .filter(([workspaceR, idContainerTmp]: [IWorkspaceRecord, string]) => idContainerTmp !== null)
      /* tslint:enable:no-unused-variable */
      .map(([workspaceR, idContainerTmp]: [IWorkspaceRecord, string]) => {
        let selectedBusId = workspaceR.get('selectedBusId');

        let busIndex = workspaceR
          .get('buses')
          .findIndex((buses: IBusRecord) => buses.get('id') === selectedBusId);

        let containersR = workspaceR.getIn(['buses', busIndex, 'containers']);

        return [containersR, idContainerTmp];
      })
      .map(([containersR, idContainerTmp]: [List<IContainerRecord>, number]) => {
        return containersR
          .find((containerR: IContainerRecord) => containerR.get('id') === idContainerTmp);
      });
  };
}

export function getCurrentComponent() {
  return (store$: Store<IStore>): Observable<IComponentRecord> => {
    return store$
      .let(getCurrentContainer())
      .withLatestFrom(
        // get the selectedComponentId
        store$
          .select('workspace')
          .filter((workspaceR: IWorkspaceRecord) => workspaceR.get('selectedComponentId') !== null)
          .map((workspaceR: IWorkspaceRecord) => workspaceR.get('selectedComponentId'))
      )
      .map(([container, selectedComponentId]: [IContainerRecord, number]) =>
        container
          .get('components')
          .find((component: IComponentRecord) => component.get('id') === selectedComponentId)
      );
  };
};

export function getCurrentServiceUnit() {
  return (store$: Store<IStore>): Observable<IServiceUnitRecord> => {
    return store$
      .let(getCurrentComponent())
      .withLatestFrom(
        // get the selectedServiceUnitId
        store$
          .select('workspace')
          .filter((workspaceR: IWorkspaceRecord) => workspaceR.get('selectedServiceUnitId') !== null)
          .map((workspaceR: IWorkspaceRecord) => workspaceR.get('selectedServiceUnitId'))
      )
      .map(([component, selectedServiceUnitId]: [IComponentRecord, number]) =>
        component
          .get('serviceUnits')
          .find((serviceUnit: IServiceUnitRecord) => serviceUnit.get('id') === selectedServiceUnitId)
      );
  };
};
