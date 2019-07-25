/**
 * Copyright (C) 2017-2019 Linagora
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

import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { debounceTime, map, tap } from 'rxjs/operators';

import { IStore } from '@shared/state/store.interface';
import { Ui } from '@shared/state/ui.actions';
import { Buses } from '@wks/state/buses/buses.actions';
import { Components } from '@wks/state/components/components.actions';
import { Containers } from '@wks/state/containers/containers.actions';
import { Workspaces } from '@wks/state/workspaces/workspaces.actions';
import {
  WorkspaceElement,
  WorkspaceElementType,
} from '@wks/state/workspaces/workspaces.selectors';

@Component({
  selector: 'app-petals-menu-view',
  templateUrl: './petals-menu-view.component.html',
  styleUrls: ['./petals-menu-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetalsMenuViewComponent implements OnInit, OnDestroy {
  onDestroy$ = new Subject<void>();

  @Input() workspaceId: string;
  @Input() tree: WorkspaceElement[];

  searchForm: FormGroup;
  search = '';

  private _focusSearchInput$ = new Subject<boolean>();
  focusSearchInput$ = this._focusSearchInput$.asObservable();

  constructor(private fb: FormBuilder, private store$: Store<IStore>) {}

  ngOnInit() {
    this.searchForm = this.fb.group({
      search: '',
    });

    this.searchForm.valueChanges
      .pipe(
        debounceTime(300),
        map(value => value.search),
        tap(search =>
          this.store$.dispatch(new Workspaces.SetPetalsSearch({ search }))
        )
      )
      .subscribe();

    this.store$
      .pipe(
        select(state => state.workspaces.searchPetals),
        tap(searchPetals => {
          this.searchForm.get('search').setValue(searchPetals, {
            emitEvent: false,
          });
          this.search = searchPetals;
        })
      )
      .subscribe();
  }

  focusSearch() {
    this.store$.dispatch(new Workspaces.SetPetalsSearch({ search: '' }));
    this._focusSearchInput$.next(true);
  }

  treeSelect(e: WorkspaceElement) {
    if (e.link) {
      this.closeSidenavOnSmallScreen();
    } else {
      this.treeToggleFold(e);
    }
  }

  treeToggleFold(e: WorkspaceElement) {
    switch (e.type) {
      case WorkspaceElementType.BUS:
        this.store$.dispatch(new Buses.ToggleFold(e));
        break;
      case WorkspaceElementType.CONTAINER:
        this.store$.dispatch(
          new Containers.ToggleFold({ id: e.id, type: 'container' })
        );
        break;
      case WorkspaceElementType.COMPCATEGORY:
        this.store$.dispatch(
          new Containers.ToggleFold({ id: e.id, type: 'components' })
        );
        break;
      case WorkspaceElementType.SLCATEGORY:
        this.store$.dispatch(
          new Containers.ToggleFold({ id: e.id, type: 'shared-libraries' })
        );
        break;
      case WorkspaceElementType.SACATEGORY:
        this.store$.dispatch(
          new Containers.ToggleFold({
            id: e.id,
            type: 'service-assemblies',
          })
        );
        break;
      case WorkspaceElementType.COMPONENT:
        this.store$.dispatch(new Components.ToggleFold(e));
        break;
    }
  }

  closeSidenavOnSmallScreen() {
    this.store$.dispatch(new Ui.CloseSidenavOnSmallScreen());
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();

    this.store$.dispatch(new Workspaces.Clean());
  }
}
