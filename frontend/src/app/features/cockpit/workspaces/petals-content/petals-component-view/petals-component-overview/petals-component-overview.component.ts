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

import { Component, OnInit, Input, ChangeDetectionStrategy, SimpleChanges, OnChanges } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';

import { IComponentRow, EComponentState } from '../../../state/components/component.interface';
import { IStore } from '../../../../../../shared/interfaces/store.interface';
import { Components } from '../../../state/components/components.reducer';
import { stateNameToPossibleActionsComponent } from '../../../../../../shared/helpers/component.helper';

@Component({
  selector: 'app-petals-component-overview',
  templateUrl: './petals-component-overview.component.html',
  styleUrls: ['./petals-component-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PetalsComponentOverviewComponent implements OnInit, OnChanges {
  @Input() component: IComponentRow;
  public parametersForm: FormGroup;

  constructor(private store$: Store<IStore>) { }

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges) {
    // if an error happen, without that control the form will be reset to the values in store
    if (changes.component.previousValue && changes.component.previousValue.id === changes.component.currentValue.id) {
      return;
    }

    const parameters = changes.component.currentValue.parameters;
    const keysParameters = Object.keys(parameters);

    this.parametersForm = new FormGroup(
      keysParameters
        .reduce((acc, key) => ({ ...acc, [key]: new FormControl(parameters[key]) }), {})
    );
  }

  getPossibleStateActions(state: string) {
    return stateNameToPossibleActionsComponent(state);
  }

  changeState(newState: string) {
    let parameters = null;

    if (this.component.state === EComponentState.Loaded && newState !== EComponentState.Unloaded) {
      parameters = this.parametersForm.value;
    }

    this.store$.dispatch({ type: Components.CHANGE_STATE, payload: { componentId: this.component.id, newState, parameters } });
  }

  componentState(index, item) {
    return this.component ? this.component.state : null;
  }
}
