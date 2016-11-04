// angular modules
import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

// rxjs
import { Observable } from 'rxjs';

// http interceptor
import { InterceptorService } from 'ng2-interceptors';

// our environment
import { environment } from '../../../environments/environment';
import { INewBus, IBus } from '../interfaces/petals.interface';

@Injectable()
export class WorkspaceService {
  constructor(private http: InterceptorService) {}

  updateWorkspaces(): Observable<Response> {
    return this.http.get(`${environment.urlBackend}/workspaces`);
  }

  updateWorkspace(idWorkspace: string): Observable<Response> {
    return this.http.get(`${environment.urlBackend}/workspaces/${idWorkspace}`);
  }

  addWorkspace(name: string) {
    return this.http.post(`${environment.urlBackend}/workspaces`, {name});
  }

  importBus(idWorkspace: string, newBus: INewBus) {
    return this.http.post(`${environment.urlBackend}/workspaces/${idWorkspace}/buses`, <any>newBus);
  }

  getBusConfig() {
    let wid = '08dc0669-f7ca-4221-bf24-d59e07f5c1ed';
    let bid = '85fd4ddf-bbd4-4562-99cc-62e7fb7d698b';
    // TODO: Get real IDs to do not forget
    return this.http.get(`${environment.urlBackend}/workspaces/${wid}/bus/${bid}`);
  }

  saveBusConfig(bus: IBus) {
    let wid = '08dc0669-f7ca-4221-bf24-d59e07f5c1ed';
    let bid = '85fd4ddf-bbd4-4562-99cc-62e7fb7d698b';
    return this.http.put(`${environment.urlBackend}/workspaces/${wid}/bus/${bid}`, <any>bus);
  }

  removeBus(idWorkspace: string, idBus: string) {
    return this.http.delete(`${environment.urlBackend}/workspaces/${idWorkspace}/buses/${idBus}`);
  }
}
