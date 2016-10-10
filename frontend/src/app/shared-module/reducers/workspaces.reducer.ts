// rxjs
import { Observable } from 'rxjs/Observable';

// immutable
import { List, Map } from 'immutable';

// ngrx
import { ActionReducer, Action } from '@ngrx/store';

// our states
import { AppState } from '../../app.state';
import { WorkspacesStateRecord, workspacesStateFactory, WorkspacesState } from './workspaces.state';

// our interfaces
import { IWorkspace } from '../interfaces/workspace.interface';

// actions
export const CHANGE_SELECTED_WORKSPACE = 'CHANGE_SELECTED_WORKSPACE';
export const EDIT_PETALS_SEARCH = 'EDIT_PETALS_SEARCH';
export const DELETE_PETALS_SEARCH = 'DELETE_PETALS_SEARCH';

export function createWorkspacesReducer(workspacesState: WorkspacesStateRecord = workspacesStateFactory(), action: Action) {
  switch (action.type) {
    case CHANGE_SELECTED_WORKSPACE:
      return workspacesState.setIn(['selectedWorkspaceId'], action.payload);

    case EDIT_PETALS_SEARCH:
      return workspacesState.setIn(['searchPetals'], action.payload);

    case DELETE_PETALS_SEARCH:
      return workspacesState.setIn(['searchPetals'], '');

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

        let ws: IWorkspace = workspaces.getIn(['workspaces', workspaces.get('selectedWorkspaceId')]);

        let nb = ws
          .get('buses')
          .map(e => filterElement(workspaces.get('searchPetals'), e))
          .filterNot(e => (e == null))
          .toList();

        return workspaces.setIn(['workspaces', workspaces.get('selectedWorkspaceId'), 'buses'], nb);
      });
  };
}