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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { select } from '@ngrx/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { LoginComponent } from 'app/features/login/login.component';
import { IUserLogin } from 'app/shared/services/users.service';
import { SharedModule } from 'app/shared/shared.module';
import { uiFactory } from 'app/shared/state/ui.interface';
import { Users } from 'app/shared/state/users.actions';
import { usersTableFactory } from 'app/shared/state/users.interface';
import {
  click,
  elementText,
  getElementBySelector,
  getInputByName,
  setInputValue,
} from 'testing';

describe(`Login component`, () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let store: MockStore;

  const DOM = {
    get usernameInpt() {
      return getInputByName(fixture, 'username');
    },
    get passwordInpt() {
      return getInputByName(fixture, 'password');
    },
    get loginButton() {
      return getElementBySelector<HTMLButtonElement>(fixture, 'form button');
    },
    get errorTxt() {
      return elementText(getElementBySelector(fixture, 'form .form-error p'));
    },
  };

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [SharedModule, ReactiveFormsModule, NoopAnimationsModule],
        declarations: [LoginComponent],
        providers: [
          {
            provide: Store,
            useClass: MockStore,
          },
          {
            provide: ActivatedRoute,
            useClass: MockActivatedRoute,
          },
        ],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    store = fixture.debugElement.injector.get(Store as any);
  });

  it(`should have enabled inputs for name and password`, () => {
    expect(DOM.usernameInpt.disabled).toBe(false);
    expect(DOM.passwordInpt.disabled).toBe(false);
  });

  it(`should enable the login button only if username and password are filled`, () => {
    expect(DOM.loginButton.disabled).toBe(true);

    setInputValue(DOM.usernameInpt, 'admin');
    fixture.detectChanges();
    expect(DOM.loginButton.disabled).toBe(true);

    setInputValue(DOM.passwordInpt, 'admin');
    fixture.detectChanges();
    expect(DOM.loginButton.disabled).toBe(false);
  });

  it(`should disable the login button if the user 'isConnecting'' or 'connectedUser' and that even if the form is valid`, () => {
    setInputValue(DOM.usernameInpt, 'admin');
    setInputValue(DOM.passwordInpt, 'admin');
    fixture.detectChanges();
    expect(DOM.loginButton.disabled).toBe(false);

    store.setUserIsConnecting(true);
    fixture.detectChanges();
    expect(DOM.loginButton.disabled).toBe(true);
    store.setUserIsConnecting(false);

    store.setConnectedUser('someUserId');
    fixture.detectChanges();
    expect(DOM.loginButton.disabled).toBe(true);
  });

  it(`should show an error message if username and password do not match`, () => {
    store.setConnectionFailed(true);
    fixture.detectChanges();
    expect(DOM.errorTxt).toEqual(`Username and password do not match`);
  });

  it(`should show 'log in' or 'Logging in' according to state`, () => {
    expect(DOM.loginButton.innerText).toEqual(`Log in`);

    store.setUserIsConnecting(true);
    fixture.detectChanges();
    expect(DOM.loginButton.innerText.trim()).toEqual(`Logging in`);
    store.setUserIsConnecting(false);

    store.setConnectedUser('someUserId');
    fixture.detectChanges();
    expect(DOM.loginButton.innerText.trim()).toEqual(`Logging in`);
  });

  it(`should dispatch a connect on submit`, () => {
    spyOn(component, 'onSubmit').and.callThrough();
    spyOn(store, 'dispatch');

    const user: IUserLogin = {
      username: 'admin id',
      password: 'admin pwd',
    };

    setInputValue(DOM.usernameInpt, user.username);
    setInputValue(DOM.passwordInpt, user.password);
    fixture.detectChanges();
    click(DOM.loginButton);
    fixture.detectChanges();

    expect(component.onSubmit).toHaveBeenCalledWith(user);

    expect(store.dispatch).toHaveBeenCalledWith(
      new Users.Connect({
        user,
        previousUrl: 'some-previous-url-if-any',
      })
    );
  });
});

class MockStore extends BehaviorSubject<any> {
  select = select.bind(this);

  constructor() {
    super({ users: usersTableFactory(), ui: uiFactory() });
  }

  dispatch(action) {}

  // helpers to simulate changes in store
  private setUsersTableValue(obj) {
    this.next({
      ...this.value,
      users: {
        ...this.value.users,
        ...obj,
      },
    });
  }

  setUserIsConnecting(isConnecting: boolean) {
    this.setUsersTableValue({ isConnecting });
  }

  setConnectedUser(connectedUser: string) {
    this.setUsersTableValue({ connectedUser });
  }

  setConnectionFailed(connectionFailed: boolean) {
    this.setUsersTableValue({ connectionFailed });
  }
}

class MockActivatedRoute {
  constructor() {}

  snapshot = {
    queryParamMap: {
      get(param: string) {
        return 'some-previous-url-if-any';
      },
    },
  };
}
