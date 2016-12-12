/**
 * Copyright (C) 2016 Linagora
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// angular modules
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// ngrx
import { Store } from '@ngrx/store';

// rxjs
import { Subscription } from 'rxjs';

// our interfaces
import { IStore } from './../../../../../../shared-module/interfaces/store.interface';
import { IServiceUnit } from './../../../../../../shared-module/interfaces/petals.interface';

// our actions
import { WorkspaceActions } from './../../../../../../shared-module/reducers/workspace.actions';
import { IServiceUnitRecord } from './../../../../../../shared-module/interfaces/petals.interface';

// our selectors
import { getCurrentServiceUnit } from './../../../../../../shared-module/reducers/workspace.reducer';

@Component({
  selector: 'app-petals-service-unit-content',
  templateUrl: './petals-service-unit-content.component.html',
  styleUrls: ['./petals-service-unit-content.component.scss']
})
export class PetalsServiceUnitContentComponent implements OnInit, OnDestroy {
  public serviceUnit: IServiceUnit;
  private serviceUnitSub: Subscription;

  constructor(private route: ActivatedRoute, private store$: Store<IStore>) {
    this.serviceUnitSub =
      store$.let(getCurrentServiceUnit())
        .map((serviceUnitR: IServiceUnitRecord) => serviceUnitR.toJS())
        .subscribe((serviceUnit: IServiceUnit) => this.serviceUnit = serviceUnit);
  }

  ngOnInit() {
    this.route.params.subscribe(param => {
      this.store$.dispatch({
        type: WorkspaceActions.FETCH_SU_DETAILS,
        payload: {
          idWorkspace: param['idWorkspace'],
          idBus: param['idBus'],
          idContainer: param['idContainer'],
          idComponent: param['idComponent'],
          idServiceUnit: param['idServiceUnit']
        }
      });
    });
  }

  ngOnDestroy() {
    this.serviceUnitSub.unsubscribe();
  }
}
