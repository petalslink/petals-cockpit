import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

import { IWorkspaces } from '../interfaces/workspace.interface';
import { IBus } from '../interfaces/petals.interface';

// the typeScript interface that defines the application state's properties
// this is to be imported wherever a reference to a workspace is used
// (reducers, components, services...)
export interface WorkspacesState extends IWorkspaces {
  selectedWorkspaceId: number;
};

// an Immutable.js Record implementation of the WorkspacesState interface.
// this only needs to be imported by reducers, since they produce new versions
// of the state
// components should only ever read the state, never change it,
// so they should only need the interface, not the record
export interface WorkspacesStateRecord extends TypedRecord<WorkspacesStateRecord>, WorkspacesState  {};

// buses for debug purpose
// TODO : Remove this and fetch it from server
const buses: Array<IBus> = [
  {
    name: 'Bus 1',
    containers: [
      {
        name: 'Container 1',
        components: [
          {
            name: 'Component 1',
            serviceUnits: [
              {name: 'SU 1'},
              {name: 'SU 2'}
            ]
          },
          {
            name: 'Component 2',
            serviceUnits: [
              {name: 'SU 3'},
              {name: 'SU 4'},
              {name: 'SU 5'}
            ]
          }
        ]
      },
      {
        name: 'Container 2',
        components: [
          {
            name: 'Component 3',
            serviceUnits: [
              {name: 'SU 6'}
            ]
          },
          {
            name: 'Component 4',
            serviceUnits: [
              {name: 'SU 7'},
              {name: 'SU 8'}
            ]
          }
        ]
      }
    ]
  }
];

// an Immutable.js record factory for the record
export const workspacesStateFactory = makeTypedFactory<WorkspacesState, WorkspacesStateRecord>({
    selectedWorkspaceId: null,
    workspaces: [
      {
        id: 0,
        name: 'Workspace 1',
        buses
      }
    ]
});
