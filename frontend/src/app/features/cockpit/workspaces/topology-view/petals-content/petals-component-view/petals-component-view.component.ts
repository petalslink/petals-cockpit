/**
 * Copyright (C) 2017-2020 Linagora
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

import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { distinctUntilChanged } from 'rxjs/operators';

import {
  getCurrentComponent,
  IComponentWithSlsAndSus,
} from '@feat/cockpit/workspaces/state/components/components.selectors';
import { stateNameToPossibleActionsComponent } from '@shared/helpers/component.helper';
import { stateToLedColor } from '@shared/helpers/shared.helper';
import { ComponentState } from '@shared/services/components.service';
import { IStore } from '@shared/state/store.interface';
import { Components } from '@wks/state/components/components.actions';
import { IServiceUnitRow } from '@wks/state/service-units/service-units.interface';
import { ISharedLibraryRow } from '@wks/state/shared-libraries/shared-libraries.interface';

@Component({
  selector: 'app-petals-component-view',
  templateUrl: './petals-component-view.component.html',
  styleUrls: ['./petals-component-view.component.scss'],
})
export class PetalsComponentViewComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  component: IComponentWithSlsAndSus;
  workspaceId$: Observable<string>;

  top: ElementRef;

  parametersForm: FormGroup;

  constructor(private store$: Store<IStore>) {}

  ngOnInit() {
    this.store$
      .pipe(
        select(getCurrentComponent),
        takeUntil(this.onDestroy$),
        tap(component => {
          this.component = component;
          if (
            component &&
            (component.updateError !== '' || !component.isUpdating) &&
            this.parametersForm
          ) {
            this.parametersForm.enable();
          }
        }),
        distinctUntilChanged(
          (prev, curr) =>
            prev && curr ? prev.parameters === curr.parameters : true
        ),
        tap(comp => {
          const parameters = comp.parameters;
          const keysParameters = Object.keys(parameters);

          this.parametersForm = new FormGroup(
            keysParameters.reduce(
              (acc, key) => ({
                ...acc,
                [key]: new FormControl(parameters[key]),
              }),
              {}
            )
          );
        })
      )
      .subscribe();

    this.workspaceId$ = this.store$.pipe(
      select(state => state.workspaces.selectedWorkspaceId)
    );
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

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
    this.parametersForm.disable();

    this.store$.dispatch(
      new Components.ChangeState({
        id: compId,
        state,
      })
    );
  }

  setParameters(compId: string) {
    this.parametersForm.disable();

    this.store$.dispatch(
      new Components.SetParameters({
        id: compId,
        parameters: this.parametersForm.value,
      })
    );
  }

  trackByComponentState(index: number, item: any) {
    return item.actionName;
  }
}
