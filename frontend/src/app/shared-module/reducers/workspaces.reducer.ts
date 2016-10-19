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

// actions
export const FETCHING_WORKSPACES = 'FETCHING_WORKSPACES';
export const WORKSPACES_FETCHED = 'WORKSPACES_FETCHED';
export const FETCHING_WORKSPACES_FAILED = 'FETCHING_WORKSPACES_FAILED';
export const CHANGE_SELECTED_WORKSPACE = 'CHANGE_SELECTED_WORKSPACE';
export const EDIT_PETALS_SEARCH = 'EDIT_PETALS_SEARCH';
export const DELETE_PETALS_SEARCH = 'DELETE_PETALS_SEARCH';
export const IMPORTING_BUS = 'IMPORTING_BUS';
export const BUS_IMPORTED = 'BUS_IMPORTED';
export const IMPORTING_BUS_FAILED = 'IMPORTING_BUS_FAILED';

export function createWorkspacesReducer(workspacesState: WorkspacesStateRecord = workspacesStateFactory(), action: Action) {
  switch (action.type) {
    case FETCHING_WORKSPACES:
      return workspacesState.setIn(['fetchingWorkspaces'], true);

    case FETCHING_WORKSPACES_FAILED:
      return workspacesState.setIn(['fetchingWorkspaces'], false);

    // when we reload all the workspaces
    // the payload is plain javascript object
    case WORKSPACES_FETCHED:
      return workspacesState
        .setIn(['fetchingWorkspaces'], false)
        .setIn(['workspaces'], fromJS(action.payload));

    case CHANGE_SELECTED_WORKSPACE:
      return workspacesState.setIn(['selectedWorkspaceId'], action.payload);

    case EDIT_PETALS_SEARCH:
      return workspacesState.setIn(['searchPetals'], action.payload);

    case DELETE_PETALS_SEARCH:
      return workspacesState.setIn(['searchPetals'], '');

    case IMPORTING_BUS:
      return workspacesState.setIn(['importingBus'], true);

    case BUS_IMPORTED:
      return workspacesState.setIn(['importingBus'], false);

    case IMPORTING_BUS_FAILED:
      return workspacesState.setIn(['importingBus'], false);

    default:
      return workspacesState;
  }
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
        let f: String = workspaces.get('searchPetals');

        if (f.trim() === '') {
          return workspaces;
        }

        let ws: IWorkspace = workspaces
          .get('workspaces')
          .filter(w => w.get('id') === workspaces.get('selectedWorkspaceId'))
          .get(0);

        let nb = ws
          .get('buses')
          .map(e => filterElement(workspaces.get('searchPetals'), e))
          .filterNot(e => (e === null))
          .toList();

        let indexUpdate = workspaces
          .get('workspaces')
          .findIndex(w => w.get('id') === workspaces.get('selectedWorkspaceId'));

        return workspaces.setIn(['workspaces', indexUpdate, 'buses'], nb);
      });
  };
}
