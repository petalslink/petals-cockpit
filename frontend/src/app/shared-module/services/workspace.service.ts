// angular modules
import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

// rxjs
import { Observable } from 'rxjs';

// http interceptor
import { InterceptorService } from 'ng2-interceptors';

// our environment
import { environment } from '../../../environments/environment';

@Injectable()
export class WorkspaceService {
  constructor(private http: InterceptorService) {}

  updateWorkspaces(): Observable<Response> {
    return this.http.get(`${environment.urlBackend}/workspaces`);
  }
}
