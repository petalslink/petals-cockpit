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
  TestBed,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Actions } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Subject } from 'rxjs/Subject';
import { v4 as uuid } from 'uuid';

import { PetalsComponentOperationsComponent } from 'app/features/cockpit/workspaces/petals-content/petals-component-view/petals-component-operations/petals-component-operations.component';
import { Components } from 'app/features/cockpit/workspaces/state/components/components.actions';
import { IComponentWithSLsAndSUs } from 'app/features/cockpit/workspaces/state/components/components.selectors';
import { SharedModule } from 'app/shared/shared.module';
import {
  getElementBySelector,
  getElementsBySelector,
  getInputByName,
  getInputListBySelector,
} from 'testing';

describe('Petals component operations', () => {
  let component: TestHostPetalsComponentOperationsComponent;
  let fixture: ComponentFixture<TestHostPetalsComponentOperationsComponent>;

  const DOM = {
    get enableHttpsInpt() {
      return getInputByName(fixture, 'enable-https');
    },
    get httpPortInpt() {
      return getInputByName(fixture, 'http-port');
    },
    get inputsParameters() {
      return getInputListBySelector(fixture, '.parameters');
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
        imports: [SharedModule, NoopAnimationsModule],
        providers: [
          {
            provide: Store,
            useClass: MockStore,
          },
          {
            provide: Actions,
            useClass: MockActions,
          },
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
      expect(actionsName).toEqual(['START', 'UNINSTALL', 'UNLOAD']);
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
      expect(actionsName).toEqual(['START', 'UNINSTALL', 'UNLOAD']);
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
        const actions: MockActions = TestBed.get(Actions);

        spyOn(uuid, 'v4').and.returnValue('id1');

        spyOn(child.uploadSu, 'resetForm');

        child.deploy(<any>'some file', 'Su name');

        // simulate the effect
        actions.next(
          new Components.DeployServiceUnitSuccess(<any>{
            correlationId: 'id1',
          })
        );

        tick();

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
      isUpdatingState: false,
      isFetchingDetails: false,
      serviceUnits: [],
      errorChangeState: '',
      isDeployingServiceUnit: false,
      parameters: {
        'http-port': '8080',
        'enable-https': 'false',
      },

      errorDeployment: '',
      id: 'contId0',
      isFolded: false,
      name: 'Container 0',
      sharedLibraries: [],
      type: 'BC',
    };
  }
}

export class MockStore {
  dispatch(data: any) {}
}

class MockActions extends Subject<Action> {
  ofType(actionType: string) {
    return this.filter(a => a.type === actionType);
  }
}
