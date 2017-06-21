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

import { IContainerRow } from '../../state/containers/containers.interface';
import {
  getCurrentContainer,
  getCurrentContainerSiblings,
} from 'app/features/cockpit/workspaces/state/containers/containers.selectors';
import { Ui } from 'app/shared/state/ui.actions';
import { Containers } from 'app/features/cockpit/workspaces/state/containers/containers.actions';

@Component({
  selector: 'app-petals-container-view',
  templateUrl: './petals-container-view.component.html',
  styleUrls: ['./petals-container-view.component.scss'],
})
export class PetalsContainerViewComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  public workspaceId$: Observable<string>;
  public container$: Observable<IContainerRow>;
  public otherContainers$: Observable<IContainerRow[]>;

  constructor(private store$: Store<IStore>, private route: ActivatedRoute) {}

  ngOnInit() {
    this.store$.dispatch(
      new Ui.SetTitles({
        titleMainPart1: 'Petals',
        titleMainPart2: 'Container',
      })
    );

    this.workspaceId$ = this.route.paramMap
      .map(p => p.get('workspaceId'))
      .distinctUntilChanged();

    this.container$ = this.store$.let(getCurrentContainer);

    this.otherContainers$ = this.store$.let(getCurrentContainerSiblings);

    this.route.paramMap
      .map(p => p.get('containerId'))
      .takeUntil(this.onDestroy$)
      .do(id => {
        this.store$.dispatch(new Containers.SetCurrent({ id }));
        this.store$.dispatch(new Containers.FetchDetails({ id }));
      })
      .switchMap(busId =>
        this.otherContainers$
          .first()
          .do(cs =>
            cs.forEach(c =>
              this.store$.dispatch(new Containers.FetchDetails(c))
            )
          )
          .map(_ => busId)
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();

    this.store$.dispatch(new Containers.SetCurrent({ id: '' }));
  }
}
