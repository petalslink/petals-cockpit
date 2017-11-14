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

import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs/Subject';

import { IBusInProgress } from 'app/features/cockpit/workspaces/state/buses-in-progress/buses-in-progress.interface';
import { Buses } from 'app/features/cockpit/workspaces/state/buses/buses.actions';
import { Components } from 'app/features/cockpit/workspaces/state/components/components.actions';
import { Containers } from 'app/features/cockpit/workspaces/state/containers/containers.actions';
import { Workspaces } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.actions';
import {
  WorkspaceElement,
  WorkspaceElementType,
} from 'app/features/cockpit/workspaces/state/workspaces/workspaces.selectors';
import { IStore } from 'app/shared/state/store.interface';
import { Ui } from 'app/shared/state/ui.actions';

@Component({
  selector: 'app-petals-menu-view',
  templateUrl: './petals-menu-view.component.html',
  styleUrls: ['./petals-menu-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetalsMenuViewComponent implements OnInit {
  @Input() workspaceId: string;
  @Input() tree: WorkspaceElement[];
  @Input() busesInProgress: IBusInProgress[];

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
      .map(value => value.search)
      .do(search => (this.search = search))
      .do(search => this.store$.dispatch(new Workspaces.SetSearch({ search })))
      .subscribe();

    this.store$
      .select(state => state.workspaces.searchPetals)
      .do(searchPetals =>
        this.searchForm.get('search').setValue(searchPetals, {
          emitEvent: false,
        })
      )
      .subscribe();
  }

  focusSearch() {
    this.store$.dispatch(new Workspaces.SetSearch({ search: '' }));
    this._focusSearchInput$.next(true);
  }

  onTreeSelect(e: WorkspaceElement) {
    if (e.link) {
      this.closeSidenavOnSmallScreen();
    } else {
      this.onTreeToggleFold(e);
    }
  }

  onTreeToggleFold(e: WorkspaceElement) {
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
}
