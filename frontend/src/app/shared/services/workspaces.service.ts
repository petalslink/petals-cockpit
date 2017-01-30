import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { environment } from './../../../environments/environment';

@Injectable()
export class WorkspacesService {
  constructor(private _http: Http) { }

  fetchWorkspaces() {
    return this._http.get(`${environment.urlBackend}/workspaces`);
  }
}
