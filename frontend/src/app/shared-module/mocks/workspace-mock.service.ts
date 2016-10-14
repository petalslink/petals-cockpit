// angular modules
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

// rxjs
import { Observable } from 'rxjs';

// our environment
import { environment } from '../../../environments/environment';

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
}
