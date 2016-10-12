// immutable
import { List, Map, fromJS } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

// our interfaces
import { IBus } from '../interfaces/petals.interface';
import { IWorkspaces, IWorkspace } from '../interfaces/workspace.interface';

// the typeScript interface that defines the application state's properties
// this is to be imported wherever a reference to a workspace is used
// (reducers, components, services...)
export interface WorkspacesState extends IWorkspaces {
  selectedWorkspaceId: number;
  searchPetals: string;
};

// an Immutable.js Record implementation of the WorkspacesState interface.
// this only needs to be imported by reducers, since they produce new versions
// of the state
// components should only ever read the state, never change it,
// so they should only need the interface, not the record
export interface WorkspacesStateRecord extends TypedRecord<WorkspacesStateRecord>, WorkspacesState {};

// buses for debug purpose
// TODO : Remove this and fetch it from server
const busesWs1: List<IBus> = fromJS([
  {
    id: 0,
    name: 'Bus 0',
    containers: [
      {
        id: 0,
        name: 'Container 0',
        components: [
          {
            id: 0,
            name: 'Component 0',
            serviceUnits: [
              {
                id: 0,
                name: 'SU 0'
              },
              {
                id: 1,
                name: 'SU 1'
              }
            ]
          },
          {
            id: 1,
            name: 'Component 1',
            serviceUnits: [
              {
                id: 2,
                name: 'SU 2'
              },
              {
                id: 3,
                name: 'SU 3'
              }
            ]
          }
        ]
      },
      {
        id: 1,
        name: 'Container 1',
        components: [
          {
            id: 2,
            name: 'Component 2',
            serviceUnits: [
              {
                id: 4,
                name: 'SU 4'
              }
            ]
          },
          {
            id: 3,
            name: 'Component 3',
            serviceUnits: [
              {
                id: 5,
                name: 'SU 5'
              },
              {
                id: 6,
                name: 'SU 6'
              }
            ]
          }
        ]
      }
    ]
  }
]);

const busesWs2: List<IBus> = fromJS([
  {
    id: 1,
    name: 'Bus 1',
    containers: [
      {
        id: 2,
        name: 'Container 2',
        components: [
          {
            id: 4,
            name: 'Component 4',
            serviceUnits: [
              {
                id: 7,
                name: 'SU 7'
              }
            ]
          },
          {
            id: 5,
            name: 'Component 5',
            serviceUnits: [
              {
                id: 8,
                name: 'SU 8'
              },
              {
                id: 9,
                name: 'SU 9'
              }
            ]
          }
        ]
      },
      {
        id: 3,
        name: 'Container 3',
        components: [
          {
            id: 6,
            name: 'Component 6',
            serviceUnits: [
              {
                id: 10,
                name: 'SU 10'
              }
            ]
          },
          {
            id: 7,
            name: 'Component 7',
            serviceUnits: [
              {
                id: 11,
                name: 'SU 11'
              },
              {
                id: 12,
                name: 'SU 12'
              }
            ]
          }
        ]
      }
    ]
  }
]);

// an Immutable.js record factory for the record
export const workspacesStateFactory = makeTypedFactory<WorkspacesState, WorkspacesStateRecord>({
    selectedWorkspaceId: null,
    searchPetals: '',
    workspaces: List<IWorkspace>([
      Map({
        id: 0,
        name: 'Workspace 0',
        buses: busesWs1
      }),
      Map({
        id: 1,
        name: 'Workspace 1',
        buses: busesWs2
      })
    ])
});
