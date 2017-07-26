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
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
  Validators,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { IStore } from '../../../../../../shared/state/store.interface';

import { Components } from 'app/features/cockpit/workspaces/state/components/components.actions';
import { IComponentWithSLsAndSUs } from 'app/features/cockpit/workspaces/state/components/components.selectors';
import { formErrorStateMatcher } from 'app/shared/helpers/form.helper';
import {
  ComponentState,
  EComponentState,
} from 'app/shared/services/components.service';
import { stateNameToPossibleActionsComponent } from '../../../../../../shared/helpers/component.helper';

@Component({
  selector: 'app-petals-component-operations',
  templateUrl: './petals-component-operations.component.html',
  styleUrls: ['./petals-component-operations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetalsComponentOperationsComponent implements OnInit, OnChanges {
  @Input() component: IComponentWithSLsAndSUs;

  parametersForm: FormGroup;

  constructor(private store$: Store<IStore>) {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    // if an error happen, without that control the form will be reset to the values in store
    if (
      changes.component.previousValue &&
      changes.component.previousValue.parameters ===
        changes.component.currentValue.parameters
    ) {
      return;
    }

    const parameters = changes.component.currentValue.parameters;
    const keysParameters = Object.keys(parameters);

    this.parametersForm = new FormGroup(
      keysParameters.reduce(
        (acc, key) => ({
          ...acc,
          [key]: new FormControl(parameters[key], Validators.required),
        }),
        {}
      )
    );
  }

  createFormErrorStateMatcher(
    control: FormControl,
    formToCheck: FormGroupDirective | NgForm
  ): boolean {
    return formErrorStateMatcher(control, formToCheck);
  }

  getPossibleStateActions(state: ComponentState) {
    return stateNameToPossibleActionsComponent(state);
  }

  changeState(state: ComponentState) {
    let parameters = null;

    if (
      this.component.state === EComponentState.Loaded &&
      state !== EComponentState.Unloaded
    ) {
      parameters = this.parametersForm.value;
    }

    this.store$.dispatch(
      new Components.ChangeState({ id: this.component.id, state, parameters })
    );
  }

  trackByComponentState(index: number, item: any) {
    return item.actionName;
  }

  deploy(file: File, serviceUnitName: string) {
    this.store$.dispatch(
      new Components.DeployServiceUnit({
        id: this.component.id,
        file,
        serviceUnitName: serviceUnitName.trim(),
      })
    );
  }
}
