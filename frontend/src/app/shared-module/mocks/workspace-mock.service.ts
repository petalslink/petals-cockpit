// angular modules
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

// rxjs
import { Observable } from 'rxjs';

// our environment
import { environment } from '../../../environments/environment';

// our helpers
import { generateUuidV4 } from '../helpers/helper';

// our interfaces
import { INewBus } from '../interfaces/petals.interface';

// our services
import { SseService } from '../services/sse.service';

@Injectable()
export class WorkspaceMockService {
  constructor(private http: Http, private sseService: SseService) { }

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
      .map(workspace => {
        return <Response> {
          ok: true,
          json: function () {
            return workspace;
          }
        };
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
        let bus: any = Object.assign({ id: generateUuidV4() }, newBus);

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
