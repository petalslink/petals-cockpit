// angular modules
import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

// rxjs
import { Observable } from 'rxjs';

// immutable
import { fromJS } from 'immutable';

// our environment
import { environment } from '../../../environments/environment';

const busesWs0 = fromJS([
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

const busesWs1 = fromJS([
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

@Injectable()
export class WorkspaceMockService {
  constructor() { }

  updateWorkspaces(): Observable<Response> {
    const response = <Response> {
      ok: true,
      json: function () {
        return [
          {
            id: 0,
            name: 'Workspace 0',
            buses: busesWs0,
          },
          {
            id: 1,
            name: 'Workspace 1',
            buses: busesWs1
          }
        ];
      }
    };

    return Observable
      .of(response)
      .delay(environment.httpDelay);
  }
}
