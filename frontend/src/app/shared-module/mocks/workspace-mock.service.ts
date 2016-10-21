// angular modules
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

// rxjs
import { Observable } from 'rxjs';

// our environment
import { environment } from '../../../environments/environment';

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

  importBus(newBus: INewBus) {
    let response = <Response>{
      ok: true,
      json: function () {
        // no need to return the newbus as we'll have to listen on sse
        // because it can be quite a long task to import a bus
        return {};
      }
    };

    // trigger a fake sse response after 3s
    this.sseService.triggerSse(3000);

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
}
