// rxjs
import { Observable } from 'rxjs/Observable';

// immutable
import { List, Map, fromJS } from 'immutable';

// ngrx
import { ActionReducer, Action } from '@ngrx/store';

// our states
import { AppState } from '../../app.state';
import { WorkspacesStateRecord, workspacesStateFactory, WorkspacesState } from './workspaces.state';

// our interfaces
import { IWorkspace } from '../interfaces/workspace.interface';

// our helpers
import { escapeStringRegexp } from '../helpers/helper';

// actions
export const FETCHING_WORKSPACES = 'FETCHING_WORKSPACES';
export const WORKSPACES_FETCHED = 'WORKSPACES_FETCHED';
export const FETCHING_WORKSPACES_FAILED = 'FETCHING_WORKSPACES_FAILED';
export const CHANGE_SELECTED_WORKSPACE = 'CHANGE_SELECTED_WORKSPACE';
export const EDIT_PETALS_SEARCH = 'EDIT_PETALS_SEARCH';
export const DELETE_PETALS_SEARCH = 'DELETE_PETALS_SEARCH';
export const IMPORTING_BUS = 'IMPORTING_BUS';
// once the http request is launched to import a bus,
// the server returns us an id (bus id) so we can display at least the name (that we already have)
// and update the object later according to the id
export const IMPORTING_BUS_MINIMAL_CONFIG = 'IMPORTING_BUS_MINIMAL_CONFIG';
export const BUS_IMPORTED = 'BUS_IMPORTED';
export const IMPORTING_BUS_FAILED = 'IMPORTING_BUS_FAILED';
export const ADD_BUS = 'ADD_BUS';
export const FETCHING_BUS_CONFIG = 'FETCHING_BUS_CONFIG';
export const FETCHING_BUS_CONFIG_SUCCESS = 'FETCHING_BUS_CONFIG_SUCCESS';
export const FETCHING_BUS_CONFIG_FAILED = 'FETCHING_BUS_CONFIG_FAILED';

export function createWorkspacesReducer(workspacesState: WorkspacesStateRecord = workspacesStateFactory(), action: Action) {
  if (action.type === FETCHING_WORKSPACES) {
    return workspacesState.setIn(['fetchingWorkspaces'], true);
  }

  else if (action.type ===  FETCHING_WORKSPACES_FAILED) {
    return workspacesState.setIn(['fetchingWorkspaces'], false);
  }

  // when we reload all the workspaces
  // the payload is plain javascript object
  else if (action.type === WORKSPACES_FETCHED) {
    return workspacesState
      .setIn(['fetchingWorkspaces'], false)
      .setIn(['workspaces'], fromJS(action.payload));
  }

  else if (action.type === CHANGE_SELECTED_WORKSPACE) {
    return workspacesState.setIn(['selectedWorkspaceId'], action.payload);
  }

  else if (action.type === EDIT_PETALS_SEARCH) {
    return workspacesState.setIn(['searchPetals'], action.payload);
  }

  else if (action.type === DELETE_PETALS_SEARCH) {
    return workspacesState.setIn(['searchPetals'], '');
  }

  else if (action.type === IMPORTING_BUS) {
    return workspacesState.setIn(['importingBus'], true);
  }

  else if (action.type === BUS_IMPORTED) {
    // once the bus is imported, move it from workspaces
    return workspacesState.setIn(['importingBus'], false);
  }

  else if (action.type === IMPORTING_BUS_FAILED) {
    return workspacesState.setIn(['importingBus'], false);
  }

  else if (action.type === IMPORTING_BUS_MINIMAL_CONFIG) {
    let selectedWorkspaceId = workspacesState.get('selectedWorkspaceId');

    let indexUpdate = workspacesState
      .get('workspaces')
      .findIndex((w: WorkspacesStateRecord) => w.get('id') === selectedWorkspaceId);

    return workspacesState.setIn(['importingBus'], false)
      .setIn(['workspaces', indexUpdate, 'busesInProgress'],
        workspacesState.getIn(['workspaces', indexUpdate, 'busesInProgress']).push(fromJS(action.payload))
      );
  }

  /* ADD_BUS */
  else if (action.type === ADD_BUS) {
    let selectedWorkspaceId = workspacesState.get('selectedWorkspaceId');

    let indexUpdate = workspacesState
      .get('workspaces')
      .findIndex((w: WorkspacesStateRecord) => w.get('id') === selectedWorkspaceId);

    let buses = workspacesState.getIn(['workspaces', indexUpdate, 'buses']);
    buses = buses.push(fromJS(action.payload));

    let workspacesStateTmp = workspacesState.setIn(['workspaces', indexUpdate, 'buses'], buses);

    let busesInProgressTmp = workspacesStateTmp
      .getIn(['workspaces', indexUpdate, 'busesInProgress'])
      .filter(bus => bus.get('id') !== action.payload.id);

    workspacesStateTmp = workspacesStateTmp.setIn(['workspaces', indexUpdate, 'busesInProgress'], busesInProgressTmp);

    return workspacesStateTmp;
  }

  /* FETCHING_BUS_CONFIG */
  else if (action.type === FETCHING_BUS_CONFIG) {
    return workspacesState.setIn(['gettingBusConfig'], true);
  }

  else if (action.type === FETCHING_BUS_CONFIG_SUCCESS) {
    let selectedWorkspaceId = workspacesState.get('selectedWorkspaceId');

    let indexWorkspaceUpdate = workspacesState
      .get('workspaces')
      .findIndex((workspaces: WorkspacesStateRecord) => workspaces.get('id') === selectedWorkspaceId);

    let indexBusUpdate = workspacesState
      .getIn(['workspaces', indexWorkspaceUpdate, 'buses'])
      .findIndex((buses: WorkspacesStateRecord) => buses.get('id') === action.payload.idBus);

    let workspacesStateTmp = workspacesState.setIn(['gettingBusConfig'], false);

    let bus = workspacesStateTmp.getIn(['workspaces', indexWorkspaceUpdate, 'buses', indexBusUpdate]);
    bus = bus.set('config', fromJS(action.payload.config));

    return workspacesStateTmp.setIn(['workspaces', indexWorkspaceUpdate, 'buses', indexBusUpdate], bus);
  }

  else if (action.type === FETCHING_BUS_CONFIG_FAILED) {
    return workspacesState.setIn(['gettingBusConfig'], false);
  }

  return workspacesState;
};

export const WorkspacesReducer: ActionReducer<WorkspacesStateRecord> = createWorkspacesReducer;

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
  return (state$: Observable<AppState>): Observable<WorkspacesState> => {
    return state$
      .map((state: AppState) => state.workspaces)
      .map((workspaces: WorkspacesStateRecord) => {
        let searchPetals: string = workspaces.get('searchPetals');

        if (typeof searchPetals === 'undefined' || searchPetals.trim() === '') {
          return workspaces;
        }

        searchPetals = escapeStringRegexp(searchPetals);

        let ws: IWorkspace = workspaces
          .get('workspaces')
          .filter(w => w.get('id') === workspaces.get('selectedWorkspaceId'))
          .get(0);

        let nb = ws
          .get('buses')
          .map(e => filterElement(searchPetals, e))
          .filterNot(e => (e === null))
          .toList();

        let indexUpdate = workspaces
          .get('workspaces')
          .findIndex(w => w.get('id') === workspaces.get('selectedWorkspaceId'));

        return workspaces.setIn(['workspaces', indexUpdate, 'buses'], nb);
      });
  };
}
