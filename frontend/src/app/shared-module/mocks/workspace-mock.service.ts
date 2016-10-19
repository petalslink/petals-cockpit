// angular modules
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

// rxjs
import { Observable } from 'rxjs';

// our environment
import { environment } from '../../../environments/environment';

// our interfaces
import { INewBus } from '../interfaces/petals.interface';

@Injectable()
export class WorkspaceMockService {
  constructor(private http: Http) { }

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

    return Observable
      .of(response)
      .delay(environment.httpDelay);
  }
}
