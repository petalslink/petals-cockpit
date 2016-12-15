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
import { IStore } from '../interfaces/store.interface';
import { INewBus } from '../interfaces/petals.interface';
import { IBus, IContainer } from '../interfaces/petals.interface';
import { IMinimalWorkspaceRecord, IMinimalWorkspacesRecord } from '../interfaces/minimal-workspaces.interface';
import { IWorkspace } from '../interfaces/workspace.interface';

// our services
import { SseService } from '../services/sse.service';
import { UserService } from '../services/user.service';

@Injectable()
export class WorkspaceMockService {
  // just to alternate reachable/unreachable
  private reachable = true;
  private reachableById = new Map<string, string>();

  private suStateById = new Map<string, string>();

  constructor(
    private http: Http,
    private store$: Store<IStore>,
    private sseService: SseService,
    private userService: UserService
  ) { }

  updateWorkspaces(): Observable<Response> {
    return this.http.get('mocks-json/workspaces.json')
      .map((res: Response) => res.json())
      .delay(environment.httpDelay)
      .map(workspaces => {
        return <Response> {
          ok: true,
          json: () => {
            return workspaces;
          }
        };
      });
  }

  updateWorkspace(idWorkspace: string): Observable<Response> {
    return this.http.get(`mocks-json/ws-${idWorkspace}.json`)
      .map((res: Response) => res.json())
      .delay(environment.httpDelay)
      .map((workspace: IWorkspace) => {
        this.userService.setLastWorkspace(idWorkspace);

        return <Response> {
          ok: true,
          json: () => {
            return workspace;
          }
        };
      })
      .catch(err => {
        if (environment.debug) {
          console.debug(err);
        }

        let obs: Observable<Response>;

        obs = new Observable(observer => {
          this.store$
            .select('minimalWorkspaces')
            .filter((minimalWorkspaces: IMinimalWorkspacesRecord) => typeof minimalWorkspaces.get('minimalWorkspaces') !== 'undefined')
            .subscribe((minimalWorkspaces: IMinimalWorkspacesRecord) => {
              let currentMinimalWorkspace = minimalWorkspaces
                .get('minimalWorkspaces')
                .find((minimalWorkspace: IMinimalWorkspaceRecord) =>
                  minimalWorkspace.get('id') === idWorkspace
                );

              let emptyWorkspace = {
                name: currentMinimalWorkspace ? currentMinimalWorkspace.get('name') : `can't reload on a created workspace with mock: true`,
                busesInProgress: [],
                buses: []
              };

              observer.next({
                ok: true,
                json: () => {
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
          usedBy: [`admin`]
        };
      }
    };

    return Observable
      .of(response)
      .delay(environment.httpDelay);
  }

  importBus(idWorkspace: string, newBus: INewBus) {
    let response = <Response>{
      ok: true,
      json: () => {
        // no need to return the newbus as we'll have to listen on sse
        // because it can be quite a long task to import a bus
        let bus: any = {
          id: generateUuidV4(),
          importIp: newBus.ip,
          importPort: newBus.port,
          importUsername: newBus.username
        };

        // trigger a fake sse response
        this.sseService.triggerSse('BUS_IMPORT_OK', { id: bus.id, bus: newBus });

        return bus;
      }
    };

    return Observable
      .of(response)
      .delay(environment.httpDelay);
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

  getDetailsBus(idWorkspace: string, idBus: string) {
    let response = <Response>{
      ok: true,
      json: () => {
        return {
          // as we use merge in the reducer,
          // whatever is added here will be added to the bus
          id: idBus
        };
      }
    };

    return Observable
      .of(response)
      .delay(environment.httpDelay);
  }

  getDetailsContainer(idWorkspace: string, idBus: string, idContainer: string) {
    return this.http.get(`mocks-json/ws-${idWorkspace}.json`)
      .map((res: Response) => res.json())
      .delay(environment.httpDelay)
      .map((workspace: IWorkspace) => {
        let containersWithoutCurrentContainer = workspace
          .buses
          .find((bus: IBus) => bus.id === idBus)
          .containers
          .filter((container: IContainer) => container.id !== idContainer);

        let reachabilities = {};

        for (let container of containersWithoutCurrentContainer) {
          if (typeof this.reachableById.get(container.id) === 'undefined') {
            this.reachableById.set(container.id, this.reachable ? 'Reachable' : 'Unreachable');
            this.reachable = !this.reachable;
          }

          reachabilities[container.id] = this.reachableById.get(container.id);
        }

        return <Response>{
          ok: true,
          json: () => {
            return {
              // as we use merge in the reducer,
              // whatever is added here will be added to the container
              id: idContainer,
              ip: '192.168.0.1',
              port: 7700,
              reachabilities,
              systemInfo: `
                Petals ESB µKernel 4.0.2
                Petals Standalone Shared Memory 4.0.2
                OpenJDK Runtime Environment 1.7.0_111-b01 Oracle Corporation
                Linux 3.16.0-4-amd64 amd64
              `
            };
          }
        };
      });
  }

  getDetailsComponent(idWorkspace: string, idBus: string, idContainer: string, idComponent: string) {
    let response = <Response>{
      ok: true,
      json: () => {
        return {
          // as we use merge in the reducer,
          // whatever is added here will be added to the component
          id: idComponent,
          state: 'Started',
          type: 'BC'
        };
      }
    };

    return Observable
      .of(response)
      .delay(environment.httpDelay);
  }

  getDetailsServiceUnit(idWorkspace: string, idBus: string, idContainer: string, idComponent: string, idServiceUnit: string) {
    let state: string = this.suStateById.get(idServiceUnit) || 'Started';

    let response = <Response>{
      ok: true,
      json: () => {
        return {
          // as we use merge in the reducer,
          // whatever is added here will be added to the component
          id: idServiceUnit,
          state
        };
      }
    };

    return Observable
      .of(response)
      .delay(environment.httpDelay);
  }

  updateServiceUnitState(idWorkspace: string, idBus: string, idContainer: string, idComponent: string, idServiceUnit: string, state: string) {
    this.suStateById.set(idServiceUnit, state);

    let response = <Response>{
      ok: true,
      json: () => {
        return {};
      }
    };

    // trigger a fake sse response
    this.sseService.triggerSse('SU_STATE_CHANGE', { id: idServiceUnit, state });

    return Observable
      .of(response)
      .delay(environment.httpDelay);
  }
}
