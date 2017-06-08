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

import { Components } from '../../state/components/components.reducer';
import { IStore } from '../../../../../shared/interfaces/store.interface';
import { Ui } from '../../../../../shared/state/ui.reducer';
import { IComponentRow } from '../../state/components/components.interface';
import {
  getCurrentComponent,
  getCurrentComponentSharedLibraries,
} from '../../state/components/components.selectors';
import { ISharedLibraryRow } from 'app/features/cockpit/workspaces/state/shared-libraries/shared-libraries.interface';

@Component({
  selector: 'app-petals-component-view',
  templateUrl: './petals-component-view.component.html',
  styleUrls: ['./petals-component-view.component.scss'],
})
export class PetalsComponentViewComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  public component$: Observable<IComponentRow>;
  public sharedLibraries$: Observable<ISharedLibraryRow[]>;

  constructor(private store$: Store<IStore>, private route: ActivatedRoute) {}

  ngOnInit() {
    this.store$.dispatch({
      type: Ui.SET_TITLES,
      payload: { titleMainPart1: 'Petals', titleMainPart2: 'Component' },
    });

    this.route.paramMap
      .map(pm => pm.get('componentId'))
      .takeUntil(this.onDestroy$)
      .do(componentId => {
        this.store$.dispatch({
          type: Components.SET_CURRENT_COMPONENT,
          payload: { componentId },
        });
        this.store$.dispatch({
          type: Components.FETCH_COMPONENT_DETAILS,
          payload: { componentId },
        });
      })
      .subscribe();

    this.component$ = this.store$.let(getCurrentComponent);
    this.sharedLibraries$ = this.store$.let(getCurrentComponentSharedLibraries);
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();

    this.store$.dispatch({
      type: Components.SET_CURRENT_COMPONENT,
      payload: { componentId: '' },
    });
  }
}
