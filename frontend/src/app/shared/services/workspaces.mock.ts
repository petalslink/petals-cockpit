import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { fetchWorkspaces } from '../../../mocks/workspaces';
import { environment } from '../../../environments/environment';

@Injectable()
export class WorkspacesMockService {
  constructor() { }

  fetchWorkspaces(): Observable<Response> {
    return Observable.of(fetchWorkspaces())
      .delay(environment.httpDelay)
      .map(workspaces => {
        return <Response>{
          ok: true,
          json: () => {
            return workspaces;
          }
        };
      });
  }
}
