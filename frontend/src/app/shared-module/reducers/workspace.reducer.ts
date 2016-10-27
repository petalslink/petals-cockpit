// ngrx
import { Action, ActionReducer, Store } from '@ngrx/store';

// immutable
import { fromJS, List, Map } from 'immutable';

// rxjs
import { Observable } from 'rxjs';

// our interfaces
import { IStore } from '../interfaces/store.interface';
import { IWorkspaceRecord} from '../interfaces/workspace.interface';
import { workspaceFactory } from './workspace.state';

// our helpers
import { escapeStringRegexp } from '../helpers/helper';

// actions
export const FETCH_WORKSPACE = 'FETCH_WORKSPACE';
export const FETCH_WORKSPACE_SUCCESS = 'FETCH_WORKSPACE_SUCCESS';
export const FETCH_WORKSPACE_FAILED = 'FETCH_WORKSPACE_FAILED';

export const EDIT_PETALS_SEARCH = 'EDIT_PETALS_SEARCH';
export const DELETE_PETALS_SEARCH = 'DELETE_PETALS_SEARCH';

export const IMPORT_BUS = 'IMPORT_BUS';
// once the http request is launched to import a bus,
// the server returns us an id (bus id) so we can display at least the name (that we already have)
// and update the object later according to the id
export const IMPORT_BUS_SUCCESS = 'IMPORT_BUS_SUCCESS';
export const IMPORT_BUS_FAILED = 'IMPORT_BUS_FAILED';

export const IMPORT_BUS_MINIMAL_CONFIG = 'IMPORT_BUS_MINIMAL_CONFIG';

export const ADD_BUS = 'ADD_BUS';
export const FETCH_BUS_CONFIG = 'FETCH_BUS_CONFIG';
export const FETCH_BUS_CONFIG_SUCCESS = 'FETCH_BUS_CONFIG_SUCCESS';
export const FETCH_BUS_CONFIG_FAILED = 'FETCH_BUS_CONFIG_FAILED';

function createWorkspaceReducer(workspaceR: IWorkspaceRecord = workspaceFactory(), action: Action) {
  if (action.type === FETCH_WORKSPACE) {
    return workspaceR.setIn(['fetchingWorkspace'], true);
  }

  else if (action.type === FETCH_WORKSPACE_FAILED) {
    return workspaceR.setIn(['fetchingWorkspace'], false);
  }

  else if (action.type === FETCH_WORKSPACE_SUCCESS) {
    // payload.data contains :
    // -----------------------
    // payload: {
    //   id: action.payload,
    //   data: {
    //     busesInProgress: [...],
    //     buses: [...]
    //   }
    // }

    return workspaceR
      .set('fetchingWorkspace', false)
      .set('id', action.payload.id)
      .mergeDeep(fromJS(action.payload.data));
  }

  else if (action.type === EDIT_PETALS_SEARCH) {
    return workspaceR.set('searchPetals', action.payload);
  }

  else if (action.type === DELETE_PETALS_SEARCH) {
    return workspaceR.set('searchPetals', '');
  }

  else if (action.type === IMPORT_BUS) {
    return workspaceR.set('importingBus', true);
  }

  else if (action.type === IMPORT_BUS_SUCCESS) {
    // once the bus is imported, move it from workspaces
    // but not here as it's been done in an async way using sse
    // CF ADD_BUS
    return workspaceR.set('importingBus', false);
  }

  else if (action.type === IMPORT_BUS_FAILED) {
    return workspaceR.set('importingBus', false);
  }

  else if (action.type === IMPORT_BUS_MINIMAL_CONFIG) {
    return workspaceR
      .set('importingBus', false)
      .set('busesInProgress',
        workspaceR.get('busesInProgress').push(fromJS({
          id: action.payload.id,
          config: {
            ip: action.payload.ip,
            port: parseInt(`${action.payload.port}`, 10),
            login: action.payload.login,
            password: action.payload.password
          }
        }))
      );
  }

  /* ADD_BUS */
  else if (action.type === ADD_BUS) {
    // TODO : Check that we don't have to use temp var instead of returning it directly
    return workspaceR
      .set('buses', workspaceR.get('buses').push(fromJS(action.payload)))
      .set('busesInProgress',
        workspaceR
          .get('busesInProgress')
          .filter((busInP: IWorkspaceRecord) => busInP.get('id') !== action.payload.id)
      );
  }

  /* FETCH_BUS_CONFIG */
  else if (action.type === FETCH_BUS_CONFIG) {
    return workspaceR.setIn(['gettingBusConfig'], true);
  }

  else if (action.type === FETCH_BUS_CONFIG_SUCCESS) {
    let busIndex = workspaceR
      .get('buses')
      .findIndex((buses: IWorkspaceRecord) => buses.get('id') === action.payload.idBus);

    return workspaceR
      .set('gettingBusConfig', false)
      .setIn(['buses', busIndex, 'config'], fromJS(action.payload.config));
  }

  else if (action.type === FETCH_BUS_CONFIG_FAILED) {
    return workspaceR.set('gettingBusConfig', false);
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
      .map((workspace: IWorkspaceRecord) => {
        let searchPetals: string = workspace.get('searchPetals');

        if (typeof searchPetals === 'undefined' || searchPetals.trim() === '') {
          return workspace;
        }

        searchPetals = escapeStringRegexp(searchPetals);

        let nb = workspace
          .get('buses')
          .map(e => filterElement(searchPetals, e))
          .filterNot(e => (e === null))
          .toList();

        return workspace.set('buses', nb);
      });
  };
}

