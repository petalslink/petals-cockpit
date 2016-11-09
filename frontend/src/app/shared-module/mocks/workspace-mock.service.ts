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

// angular modules
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

// rxjs
import { Observable } from 'rxjs';

// ngrx
import { Store } from '@ngrx/store';

// our environment
import { environment } from '../../../environments/environment';

// our helpers
import { generateUuidV4 } from '../helpers/helper';

// our interfaces
import { IStore } from './../interfaces/store.interface';
import { INewBus } from '../interfaces/petals.interface';
import { IMinimalWorkspaceRecord, IMinimalWorkspacesRecord } from './../interfaces/minimal-workspaces.interface';
import { IWorkspace } from './../interfaces/workspace.interface';

// our services
import { SseService } from '../services/sse.service';

@Injectable()
export class WorkspaceMockService {
  constructor(private http: Http, private store$: Store<IStore>, private sseService: SseService) { }

  updateWorkspaces(): Observable<Response> {
    return this.http.get('/mocks-json/workspaces.json')
      .map((res: Response) => res.json())
      .delay(environment.httpDelay)
      .map(workspaces => {
        return <Response> {
          ok: true,
          json: function () {
            return workspaces;
          }
        };
      });
  }

  updateWorkspace(idWorkspace: string): Observable<Response> {
    return this.http.get(`/mocks-json/ws-${idWorkspace}.json`)
      .map((res: Response) => res.json())
      .delay(environment.httpDelay)
      .map((workspace: IWorkspace) => {
        return <Response> {
          ok: true,
          json: function () {
            return workspace;
          }
        };
      })
      .catch((res: Response) => {
        let obs: Observable<Response>;

        obs = new Observable(observer => {
          this.store$
            .select('minimalWorkspaces')
            .filter((minimalWorkspaces: IMinimalWorkspacesRecord) => typeof minimalWorkspaces.get('minimalWorkspaces') !== 'undefined')
            .subscribe((minimalWorkspaces: IMinimalWorkspacesRecord) => {
              let currentMinimalWorkspace = minimalWorkspaces.get('minimalWorkspaces').find((minimalWorkspace: IMinimalWorkspaceRecord) =>
                minimalWorkspace.get('id') === idWorkspace
              );

              let emptyWorkspace = {
                name: currentMinimalWorkspace ? currentMinimalWorkspace.get('name') : `can't reload on a created workspace with mock: true`,
                busesInProgress: [],
                buses: []
              };

              observer.next({
                ok: true,
                json: function () {
                  return emptyWorkspace;
                }
              });
            });
        });

        return obs;
      });
  }

  addWorkspace(name: string) {
    let response = <Response>{
      ok: true,
      json: () => {
        return {
          id: generateUuidV4(),
          name,
          usedBy: `You're the only one to use this workspace`
        };
      }
    };

    return Observable
      .of(response)
      .delay(environment.httpDelay);
  }

  importBus(newBus: INewBus) {
    let response = <Response>{
      ok: true,
      json: () => {
        // no need to return the newbus as we'll have to listen on sse
        // because it can be quite a long task to import a bus
        let bus: any = { id: generateUuidV4() };

        // trigger a fake sse response
        this.sseService.triggerSse(bus);

        return bus;
      }
    };

    return Observable
      .of(response)
      .delay(environment.httpDelay);
  }

  getBusConfig(): Observable<Response> {
    return this.http.get('/mocks-json/bus0-demo.json')
      .map((res: Response) => res.json())
      .delay(environment.httpDelay)
      .map(config => {
        return <Response> {
          ok: true,
          json: function () {
            return config;
          }
        };
      });
  }

  removeBus(idWorkspace: string, idBus: string): Observable<Response> {
    let response = <Response>{
      ok: true,
      json: () => {
        return {};
      }
    };

    return Observable
      .of(response)
      .delay(environment.httpDelay);
  }
}
