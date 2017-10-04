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

import { Component, OnInit } from '@angular/core';
import {
  async,
  ComponentFixture,
  fakeAsync,
  flush,
  TestBed,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import * as uuid from 'uuid';

import { PetalsComponentOperationsComponent } from 'app/features/cockpit/workspaces/petals-content/petals-component-view/petals-component-operations/petals-component-operations.component';
import { Components } from 'app/features/cockpit/workspaces/state/components/components.actions';
import { IComponentWithSLsAndSUs } from 'app/features/cockpit/workspaces/state/components/components.selectors';
import { SharedModule } from 'app/shared/shared.module';
import {
  getElementBySelector,
  getElementsBySelector,
  getInputListBySelector,
} from 'testing';

describe('Petals component operations', () => {
  let component: TestHostPetalsComponentOperationsComponent;
  let fixture: ComponentFixture<TestHostPetalsComponentOperationsComponent>;

  const DOM = {
    get inputsParameters() {
      return getInputListBySelector(fixture, '.component-parameters');
    },
    get compState() {
      return getElementBySelector<HTMLSpanElement>(fixture, '.component-state');
    },
    get actionsNamesList() {
      return getElementsBySelector<HTMLSpanElement>(
        fixture,
        '.list-actions-name .action-name'
      );
    },
  };

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [
          StoreModule.forRoot({}),
          EffectsModule.forRoot([]),
          SharedModule,
          NoopAnimationsModule,
        ],
        declarations: [
          TestHostPetalsComponentOperationsComponent,
          PetalsComponentOperationsComponent,
        ],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(
      TestHostPetalsComponentOperationsComponent
    );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it(`should have inputs organized by alphabetical order`, () => {
    const placeholders = DOM.inputsParameters.map(input => input.placeholder);
    expect(placeholders).toEqual(['enable-https', 'http-port']);
  });

  it(`should show the state of the component and update it when input changes`, () => {
    expect(DOM.compState.innerText).toEqual('Loaded');

    component.component = {
      ...component.component,
      state: 'Started',
    };

    fixture.detectChanges();

    expect(DOM.compState.innerText).toEqual('Started');
  });

  describe(`should show the available states in buttons`, () => {
    it(`should have install and unload if loaded`, () => {
      component.component = {
        ...component.component,
        state: 'Loaded',
      };

      fixture.detectChanges();

      const actionsName = DOM.actionsNamesList.map(
        actionName => actionName.innerText
      );
      expect(actionsName).toEqual(['INSTALL', 'UNLOAD']);
    });

    it(`should have start, uninstall, and unload if shutdown`, () => {
      component.component = {
        ...component.component,
        state: 'Shutdown',
      };

      fixture.detectChanges();

      const actionsName = DOM.actionsNamesList.map(
        actionName => actionName.innerText
      );
      // TODO the order is incorrect, but there is a bug in @angular/testing
      // https://github.com/angular/angular/issues/13066
      expect(actionsName).toEqual(['UNLOAD', 'START', 'UNINSTALL']);
    });

    it(`should have stop if started`, () => {
      component.component = {
        ...component.component,
        state: 'Started',
      };

      fixture.detectChanges();

      const actionsName = DOM.actionsNamesList.map(
        actionName => actionName.innerText
      );
      expect(actionsName).toEqual(['STOP']);
    });

    it(`should have start, uninstall, and unload if stopped`, () => {
      component.component = {
        ...component.component,
        state: 'Stopped',
      };

      fixture.detectChanges();

      const actionsName = DOM.actionsNamesList.map(
        actionName => actionName.innerText
      );
      // TODO the order is incorrect, but there is a bug in @angular/testing
      // https://github.com/angular/angular/issues/13066
      expect(actionsName).toEqual(['UNLOAD', 'START', 'UNINSTALL']);
    });
  });

  describe(`should test deploy method`, () => {
    let child: PetalsComponentOperationsComponent;

    beforeEach(() => {
      child = fixture.debugElement.query(
        By.css('app-petals-component-operations')
      ).componentInstance;
    });

    it(`should deploy a Service Unit`, () => {
      const store = TestBed.get(Store);

      spyOn(store, 'dispatch').and.callThrough();

      child.deploy(<any>'some file', 'Su name');

      expect(store.dispatch).toHaveBeenCalledWith(
        new Components.DeployServiceUnit({
          id: 'contId0',
          file: 'some file' as any,
          serviceUnitName: 'Su name',
          correlationId: <any>jasmine.any(String),
        })
      );
    });

    it(
      `should reset upload form once service unit has been deployed`,
      fakeAsync(() => {
        spyOn(uuid, 'v4').and.returnValue('id1');

        spyOn(child.uploadSu, 'resetForm');

        child.deploy(<any>'some file', 'Su name');

        // simulate the effect
        TestBed.get(Store).dispatch(
          new Components.DeployServiceUnitSuccess(<any>{
            correlationId: 'id1',
          })
        );

        flush();

        expect(child.uploadSu.resetForm).toHaveBeenCalled();
      })
    );
  });

  it(`
    should reset upload SU form if user changes from a component to another
    (with at least a change of the parameters)`, () => {
    let child: PetalsComponentOperationsComponent;

    child = fixture.debugElement.query(
      By.css('app-petals-component-operations')
    ).componentInstance;

    spyOn(child.uploadSu, 'resetForm');

    fixture.detectChanges();

    expect(child.uploadSu.resetForm).not.toHaveBeenCalled();

    component.component = {
      ...component.component,
      // need a new ref for parameters otherwise won't trigger the resetForm
      parameters: {},
    };

    fixture.detectChanges();

    expect(child.uploadSu.resetForm).toHaveBeenCalled();
  });
});

@Component({
  template: `
    <app-petals-component-operations [component]="component"></app-petals-component-operations>
  `,
})
class TestHostPetalsComponentOperationsComponent implements OnInit {
  component: IComponentWithSLsAndSUs;

  ngOnInit() {
    this.component = {
      containerId: 'contId0',
      state: 'Loaded',
      isUpdating: false,
      serviceUnits: [],
      updateError: '',
      deployError: '',
      parameters: {
        'http-port': '8080',
        'enable-https': 'false',
      },
      id: 'contId0',
      isFolded: false,
      name: 'Container 0',
      sharedLibraries: [],
      type: 'BC',
    };
  }
}
