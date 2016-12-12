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
import { IComponent, IComponentRecord } from './../../../../../../shared-module/interfaces/petals.interface';

// our actions
import { WorkspaceActions } from './../../../../../../shared-module/reducers/workspace.actions';
import { getCurrentComponent } from './../../../../../../shared-module/reducers/workspace.reducer';

@Component({
  selector: 'app-petals-component-content',
  templateUrl: './petals-component-content.component.html',
  styleUrls: ['./petals-component-content.component.scss']
})
export class PetalsComponentContentComponent implements OnInit, OnDestroy {
  public component: IComponent;
  private componentSub: Subscription;

  constructor(private route: ActivatedRoute, private store$: Store<IStore>) {
    this.componentSub =
      store$.let(getCurrentComponent())
        .map((componentR: IComponentRecord) => componentR.toJS())
        .subscribe((component: IComponent) => this.component = component);
  }

  ngOnDestroy() {
    this.componentSub.unsubscribe();
  }

  ngOnInit() {
    this.route.params.subscribe(param => {
      this.store$.dispatch({
        type: WorkspaceActions.FETCH_COMPONENT_DETAILS,
        payload: {
          idWorkspace: param['idWorkspace'],
          idBus: param['idBus'],
          idContainer: param['idContainer'],
          idComponent: param['idComponent']
        }
      });
    });
  }
}
