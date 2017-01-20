import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { generateUuidV4 } from '../../../../../shared/helpers/shared.helper';
import { IBusInProgress } from './bus-in-progress.interface';
import { environment } from './../../../../../../environments/environment';

@Injectable()
export class BusesInProgressMockService {
  constructor() { }

  postBus(idWorkspace: string, bus: IBusInProgress) {
    const response = <Response>{
      ok: true,
      json: () => {
        return Object.assign({}, bus, { id: generateUuidV4() });
      }
    };

    return Observable
      .of(response)
      .delay(environment.httpDelay);
  }
}
