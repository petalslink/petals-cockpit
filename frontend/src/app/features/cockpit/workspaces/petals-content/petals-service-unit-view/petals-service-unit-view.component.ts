import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { IStore } from '../../../../../shared/interfaces/store.interface';
import { Ui } from '../../../../../shared/state/ui.reducer';
import { ServiceUnits } from '../../state/service-units/service-units.reducer';
import { getCurrentServiceUnit } from '../../state/service-units/service-units.selectors';
import { IServiceUnitRow } from '../../state/service-units/service-unit.interface';

@Component({
  selector: 'app-petals-service-unit-view',
  templateUrl: './petals-service-unit-view.component.html',
  styleUrls: ['./petals-service-unit-view.component.scss']
})
export class PetalsServiceUnitViewComponent implements OnInit, OnDestroy {
  public serviceUnit$: Observable<IServiceUnitRow>;

  constructor(private _store$: Store<IStore>, private _route: ActivatedRoute) { }

  ngOnInit() {
    this.serviceUnit$ = this._store$.let(getCurrentServiceUnit());

    this._store$.dispatch({ type: Ui.SET_TITLES, payload: { titleMainPart1: 'Petals', titleMainPart2: 'Service Unit' } });

    this._route
      .params
      .map((params: { workspaceId: string, serviceUnitId: string }) => {
        this._store$.dispatch({ type: ServiceUnits.SET_CURRENT_SERVICE_UNIT, payload: { serviceUnitId: params.serviceUnitId } });
      })
      .subscribe();
  }

  ngOnDestroy() {
    this._store$.dispatch({ type: ServiceUnits.SET_CURRENT_SERVICE_UNIT, payload: { serviceUnitId: '' } });
  }
}
