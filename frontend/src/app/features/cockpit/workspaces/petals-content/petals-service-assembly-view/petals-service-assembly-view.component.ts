/**
 * Copyright (C) 2017 Linagora
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

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { IStore } from '../../../../../shared/state/store.interface';

import {
  getCurrentServiceAssembly,
  IServiceAssemblyWithSUsAndComponents,
} from 'app/features/cockpit/workspaces/state/service-assemblies/service-assemblies.selectors';

import { Ui } from 'app/shared/state/ui.actions';
import { ServiceAssemblies } from 'app/features/cockpit/workspaces/state/service-assemblies/service-assemblies.actions';

@Component({
  selector: 'app-petals-service-assembly-view',
  templateUrl: './petals-service-assembly-view.component.html',
  styleUrls: ['./petals-service-assembly-view.component.scss'],
})
export class PetalsServiceAssemblyViewComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  serviceAssembly$: Observable<IServiceAssemblyWithSUsAndComponents>;
  workspaceId$: Observable<string>;

  constructor(private store$: Store<IStore>, private route: ActivatedRoute) {}

  ngOnInit() {
    const serviceAssemblyId$ = this.route.paramMap
      .map(pm => pm.get('serviceAssemblyId'))
      .distinctUntilChanged();

    this.serviceAssembly$ = this.store$.let(getCurrentServiceAssembly);

    this.store$.dispatch(
      new Ui.SetTitles({
        titleMainPart1: 'Petals',
        titleMainPart2: 'Service Assemblies',
      })
    );

    serviceAssemblyId$
      .takeUntil(this.onDestroy$)
      .do(id => {
        this.store$.dispatch(new ServiceAssemblies.SetCurrent({ id }));
        this.store$.dispatch(new ServiceAssemblies.FetchDetails({ id }));
      })
      .subscribe();

    this.workspaceId$ = this.store$.select(
      state => state.workspaces.selectedWorkspaceId
    );
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();

    this.store$.dispatch(new ServiceAssemblies.SetCurrent({ id: '' }));
  }
}
