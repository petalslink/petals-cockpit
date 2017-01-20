import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { IBusInProgress } from './bus-in-progress.interface';
import { environment } from './../../../../../../environments/environment';

@Injectable()
export class BusesInProgressService {
  constructor(private _http: Http) { }

  postBus(idWorkspace: string, bus: IBusInProgress) {
    return this._http.post(`${environment.urlBackend}/workspaces/${idWorkspace}/buses`, bus);
  }
}
