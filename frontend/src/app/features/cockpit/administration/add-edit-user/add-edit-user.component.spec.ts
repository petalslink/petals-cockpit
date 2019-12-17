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
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AddEditUserComponent } from '@cock/administration/add-edit-user/add-edit-user.component';
import { SharedModule } from '@shared/shared.module';
import { IUser } from '@shared/state/users.interface';
import {
  click,
  getButtonByClass,
  getInputByName,
  getToggleSlideByName,
  setInputValue,
} from '@testing/index';

describe('Administration edit user', () => {
  let component: TestHostAddUserComponent;
  let fixture: ComponentFixture<TestHostAddUserComponent>;

  const DOM = {
    get usernameInpt() {
      return getInput('username');
    },
    get nameInpt() {
      return getInput('name');
    },
    get passwordInpt() {
      return getInput('password');
    },
    get adminFormBtn() {
      return getToggleSlide('isAdmin');
    },
    get addUserFormBtn() {
      return getBtn('btn-add-user-form');
    },
    get deleteFormBtn() {
      return getBtn('btn-delete-form');
    },
    get cancelFormBtn() {
      return getBtn('btn-cancel-form');
    },
  };

  const getInput = (name: string) => getInputByName(fixture, name);

  const getBtn = (className: string) => getButtonByClass(fixture, className);

  const getToggleSlide = (name: string) => getToggleSlideByName(fixture, name);

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [SharedModule.forRoot(), NoopAnimationsModule],
        declarations: [TestHostAddUserComponent, AddEditUserComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostAddUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it(`should add a user only if username, name and password are defined`, () => {
    setInputValue(DOM.usernameInpt, 'usr1');
    fixture.detectChanges();

    expect(DOM.addUserFormBtn.disabled).toBe(true);
    expect(DOM.cancelFormBtn.disabled).toBe(false);

    // -------------------------

    setInputValue(DOM.nameInpt, 'User 1');
    fixture.detectChanges();

    expect(DOM.addUserFormBtn.disabled).toBe(true);
    expect(DOM.cancelFormBtn.disabled).toBe(false);

    // -------------------------

    setInputValue(DOM.passwordInpt, 'some password');
    fixture.detectChanges();

    expect(DOM.addUserFormBtn.disabled).toBe(false);
    expect(DOM.cancelFormBtn.disabled).toBe(false);
  });

  it(`should trigger an output when cancelling and reset form values`, () => {
    spyOn(component, 'evtCancel');

    setInputValue(DOM.usernameInpt, 'usr1');
    setInputValue(DOM.nameInpt, 'User 1');
    setInputValue(DOM.passwordInpt, 'some password');

    fixture.detectChanges();

    expect(DOM.cancelFormBtn.disabled).toBe(false);

    expect(component.evtCancel).not.toHaveBeenCalled();

    click(DOM.cancelFormBtn);

    expect(component.evtCancel).toHaveBeenCalled();
  });

  it(`should trigger an output when adding user`, () => {
    spyOn(component, 'evtSubmit');

    setInputValue(DOM.usernameInpt, 'usr1');
    setInputValue(DOM.nameInpt, 'User 1');
    setInputValue(DOM.passwordInpt, 'some password');

    fixture.detectChanges();

    expect(DOM.addUserFormBtn.disabled).toBe(false);

    expect(component.evtSubmit).not.toHaveBeenCalled();

    click(DOM.addUserFormBtn);

    expect(component.evtSubmit).toHaveBeenCalled();
  });

  it(`should only display name and password if there's a user in input`, () => {
    component.user = {
      id: 'usr1',
      name: 'User 1',
      isAdmin: false,
    };

    fixture.detectChanges();

    expect(DOM.usernameInpt).toBe(null);
  });

  it(`should disable the update button if the user has no change`, () => {
    spyOn(component, 'evtSubmit');
    spyOn(component, 'evtCancel');

    component.user = {
      id: 'usr1',
      name: 'User 1',
      isAdmin: false,
    };

    fixture.detectChanges();

    expect(DOM.nameInpt.value).toEqual('User 1');
    expect(DOM.adminFormBtn.getAttribute('class').includes('mat-checked')).toBe(
      false
    );

    expect(component.evtSubmit).not.toHaveBeenCalled();
    expect(component.evtCancel).not.toHaveBeenCalled();
    expect(DOM.addUserFormBtn.disabled).toBe(true);

    setInputValue(DOM.nameInpt, 'User 2');
    fixture.detectChanges();
    expect(DOM.addUserFormBtn.disabled).toBe(false);
  });

  it(`should display a delete button only if a user is passed in input`, () => {
    // without user, there shouldn't be any delete button
    fixture.detectChanges();
    expect(DOM.deleteFormBtn).toBe(null);

    // with a user, it should be defined
    component.user = {
      id: 'usr1',
      name: 'User 1',
      isAdmin: false,
    };

    fixture.detectChanges();
    expect(DOM.deleteFormBtn).toBeDefined();
    expect(DOM.deleteFormBtn).not.toBeNull();
  });

  it(`should disable delete button accordingly to the input`, () => {
    component.user = {
      id: 'usr1',
      name: 'User 1',
      isAdmin: false,
    };
    fixture.detectChanges();

    // by default, should be disabled
    expect(DOM.deleteFormBtn.disabled).toBe(true);

    component.canDelete = true;
    fixture.detectChanges();
    expect(DOM.deleteFormBtn.disabled).toBe(false);
  });

  it(`should trigger an ouput to delete a user`, () => {
    spyOn(component, 'evtDelete');

    component.user = {
      id: 'usr1',
      name: 'User 1',
      isAdmin: false,
    };
    component.canDelete = true;
    fixture.detectChanges();

    expect(DOM.deleteFormBtn.disabled).toBe(false);

    click(DOM.deleteFormBtn);
    fixture.detectChanges();

    expect(component.evtDelete).toHaveBeenCalled();
  });
});

@Component({
  template: `
    <app-add-edit-user
      [user]="user"
      [canDelete]="canDelete"
      (evtSubmit)="evtSubmit($event)"
      (evtCancel)="evtCancel($event)"
      (evtDelete)="evtDelete($event)"></app-add-edit-user>
  `,
})
class TestHostAddUserComponent {
  user: IUser;
  canDelete: boolean;

  evtSubmit() {}

  evtCancel() {}

  evtDelete() {}
}
