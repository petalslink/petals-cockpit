import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { fetchWorkspaces } from './../../../../../../mocks/workspaces';
import { environment } from './../../../../../../environments/environment';
import { fetchWorkspace0 } from './../../../../../../mocks/workspace-0';

@Injectable()
export class WorkspacesMockService {
  constructor() { }

  fetchWorkspaces(): Observable<Response> {
    return Observable.of(fetchWorkspaces)
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

  fetchWorkspace(idWorkspace: string): Observable<Response> {
    let fetchedWorkspace;

    if (idWorkspace === '559b4c47-5026-435c-bd6e-a47a903a7ba5') {
      fetchedWorkspace = fetchWorkspace0;
    }

    return Observable.of(fetchedWorkspace)
      .delay(environment.httpDelay)
      .map(workspace => {
        return <Response>{
          ok: true,
          json: () => {
            return workspace;
          }
        };
      });
  }
}
