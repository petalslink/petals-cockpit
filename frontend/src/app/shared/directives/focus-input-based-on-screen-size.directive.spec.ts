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

import { Component } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  flush,
  TestBed,
} from '@angular/core/testing';
import { Store } from '@ngrx/store';

import { distinctUntilChanged, map } from 'rxjs/operators';

import { SharedModule } from '@shared/shared.module';
import { ScreenSize } from '@shared/state/ui.interface';
import { BehaviorSubject } from 'rxjs';
import { getInputByName } from 'testing';

describe(`appFocusInputIfLargeScreen`, () => {
  let fixtureDefault: ComponentFixture<HostDefaultComponent>;

  let componentParams: HostWithParamsComponent;
  let fixtureParams: ComponentFixture<HostWithParamsComponent>;

  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule.forRoot()],
      declarations: [HostDefaultComponent, HostWithParamsComponent],
      providers: [
        {
          provide: Store,
          useClass: MockStore,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    store = TestBed.get(Store);
    store.sendMockValue({
      ui: { screenSize: 'lg' },
    });
  });

  describe(`directive without any parameter passed`, () => {
    beforeEach(() => {
      fixtureDefault = TestBed.createComponent(HostDefaultComponent);
    });

    it(
      `should by default focus an element on large screen`,
      fakeAsync(() => {
        const nativeEl = getInputByName(fixtureDefault, 'inpt');
        spyOn(nativeEl, 'focus');

        fixtureDefault.detectChanges();
        flush();

        expect(nativeEl.focus).toHaveBeenCalled();
      })
    );
  });

  describe(`directive with parameter to toggle it on/off`, () => {
    let inputElement: HTMLInputElement;

    beforeEach(() => {
      fixtureParams = TestBed.createComponent(HostWithParamsComponent);
      componentParams = fixtureParams.componentInstance;

      inputElement = getInputByName(fixtureParams, 'inpt');
      spyOn(inputElement, 'focus');
    });

    it(
      `should focus an element on large screen when the directive is called with true`,
      fakeAsync(() => {
        componentParams.isFocusActivated = true;

        fixtureParams.detectChanges();
        flush();

        expect(inputElement.focus).toHaveBeenCalled();
      })
    );

    it(
      `should not focus an element on large screen when the directive is called with false`,
      fakeAsync(() => {
        componentParams.isFocusActivated = false;

        fixtureParams.detectChanges();
        flush();

        expect(inputElement.focus).not.toHaveBeenCalled();
      })
    );

    it(
      `should not focus an element on small screen even if the directive is called with true`,
      fakeAsync(() => {
        store.sendMockValue({
          ui: { screenSize: 'sm' },
        });

        componentParams.isFocusActivated = true;

        fixtureParams.detectChanges();
        flush();

        expect(inputElement.focus).not.toHaveBeenCalled();
      })
    );

    it(
      `should focus an element with the directive called with true (previously called with false)`,
      fakeAsync(() => {
        componentParams.isFocusActivated = false;

        fixtureParams.detectChanges();
        flush();

        expect(inputElement.focus).not.toHaveBeenCalled();

        componentParams.isFocusActivated = true;

        fixtureParams.detectChanges();
        flush();

        expect(inputElement.focus).toHaveBeenCalled();
      })
    );
  });
});

@Component({
  selector: 'app-host-default-component',
  template: `
    <input type="text" name="inpt" appFocusInputIfLargeScreen>
  `,
})
export class HostDefaultComponent {}

@Component({
  selector: 'app-host-default-component',
  template: `
    <input type="text" name="inpt" [appFocusInputIfLargeScreen]="isFocusActivated">
  `,
})
export class HostWithParamsComponent {
  isFocusActivated: boolean;
}

interface MinimalStore {
  ui: { screenSize: ScreenSize };
}

export class MockStore extends BehaviorSubject<MinimalStore> {
  constructor() {
    super({
      ui: { screenSize: '' },
    });
  }

  select(fn: () => any) {
    return this.pipe(map(fn), distinctUntilChanged());
  }

  sendMockValue(value: MinimalStore) {
    this.next(value);
  }
}
