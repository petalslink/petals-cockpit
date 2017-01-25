import { Injectable } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { IStore } from '../../../../../shared/interfaces/store.interface';

@Injectable()
export class BusesEffects {
  constructor(
    private actions$: Actions,
    private store$: Store<IStore>
  ) { }
}
