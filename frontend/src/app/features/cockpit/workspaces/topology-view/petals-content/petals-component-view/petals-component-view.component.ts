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

import { Component, ElementRef, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { IStore } from '@shared/state/store.interface';

import {
  getCurrentComponent,
  IComponentWithSlsAndSus,
} from '@feat/cockpit/workspaces/state/components/components.selectors';
import { stateNameToPossibleActionsComponent } from '@shared/helpers/component.helper';
import { stateToLedColor } from '@shared/helpers/shared.helper';
import { ComponentState } from '@shared/services/components.service';
import { Components } from '@wks/state/components/components.actions';
import { IServiceUnitRow } from '@wks/state/service-units/service-units.interface';
import { ISharedLibraryRow } from '@wks/state/shared-libraries/shared-libraries.interface';

@Component({
  selector: 'app-petals-component-view',
  templateUrl: './petals-component-view.component.html',
  styleUrls: ['./petals-component-view.component.scss'],
})
export class PetalsComponentViewComponent implements OnInit {
  component$: Observable<IComponentWithSlsAndSus>;
  workspaceId$: Observable<string>;

  top: ElementRef;

  parametersForm: FormGroup;

  constructor(private store$: Store<IStore>) {}

  ngOnInit() {
    this.component$ = this.store$.pipe(select(getCurrentComponent));

    this.workspaceId$ = this.store$.pipe(
      select(state => state.workspaces.selectedWorkspaceId)
    );
  }

  // TODO: We don't need to use ngOnChanges in the parent component.
  // For now, keep this code commented, and reuse it during the next refactor of the following issues:
  // https://gitlab.com/linagora/petals-cockpit/issues/574
  // https://gitlab.com/linagora/petals-cockpit/issues/575
  // ngOnChanges(changes: SimpleChanges) {
  //   // if an error happens, without that control the form will be reset to the values in store
  //   if (
  //     changes.component.previousValue &&
  //     changes.component.previousValue.parameters ===
  //       changes.component.currentValue.parameters
  //   ) {
  //     return;
  //   }

  //   const parameters = changes.component.currentValue.parameters;
  //   const keysParameters = Object.keys(parameters);

  //   this.parametersForm = new FormGroup(
  //     keysParameters.reduce(
  //       (acc, key) => ({ ...acc, [key]: new FormControl(parameters[key]) }),
  //       {}
  //     )
  //   );
  // }

  trackBySl(i: number, sl: ISharedLibraryRow) {
    return sl.id;
  }

  trackBySu(i: number, su: IServiceUnitRow) {
    return su.id;
  }

  getLedColorFromState(state: ComponentState) {
    return stateToLedColor(state);
  }

  getPossibleStateActions(state: ComponentState) {
    return stateNameToPossibleActionsComponent(state);
  }

  changeState(state: ComponentState, compId: string) {
    this.store$.dispatch(
      new Components.ChangeState({
        id: compId,
        state,
      })
    );
  }

  setParameters(compId: string) {
    this.store$.dispatch(
      new Components.SetParameters({
        id: compId,
        parameters: this.parametersForm.value,
      })
    );
    // if it's succeeds, we want to go back to top to continue our business
    // if it fails, we want to go back to top to see the error
    this.top.nativeElement.scrollIntoView();
  }

  trackByComponentState(index: number, item: any) {
    return item.actionName;
  }
}
