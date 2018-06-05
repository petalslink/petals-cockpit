/**
 * Copyright (C) 2017-2018 Linagora
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
import { Store, StoreModule } from '@ngrx/store';

import { IUserLogin } from '@shared/services/users.service';
import { SharedModule } from '@shared/shared.module';
import { UiReducer } from '@shared/state/ui.reducer';
import { Users } from '@shared/state/users.actions';
import { UsersReducer } from '@shared/state/users.reducer';
import {
  click,
  elementText,
  getElementBySelector,
  getInputByName,
  setInputValue,
} from 'testing';
import { LoginComponent } from './login.component';

describe(`Login component`, () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let store: Store<any>;

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
        imports: [
          StoreModule.forRoot({
            users: UsersReducer.reducer,
            ui: UiReducer.reducer,
          }),
          SharedModule.forRoot(),
          ReactiveFormsModule,
          NoopAnimationsModule,
        ],
        declarations: [LoginComponent],
        providers: [
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

    store = TestBed.get(Store);
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

  it(`should change the login button during connect`, () => {
    spyOn(component, 'onSubmit').and.callThrough();
    spyOn(store, 'dispatch').and.callThrough();

    const user: IUserLogin = { username: 'admin', password: 'pass' };

    setInputValue(DOM.usernameInpt, user.username);
    setInputValue(DOM.passwordInpt, user.password);
    fixture.detectChanges();
    expect(DOM.loginButton.disabled).toBe(false);
    expect(DOM.loginButton.textContent.toLowerCase()).toContain(`log in`);

    click(DOM.loginButton);
    fixture.detectChanges();
    expect(DOM.loginButton.disabled).toBe(true);
    expect(DOM.loginButton.textContent.toLowerCase()).toContain(`logging in`);
    expect(component.onSubmit).toHaveBeenCalledWith(user);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Users.Connect({
        user,
        previousUrl: 'some-previous-url-if-any',
      })
    );

    // if connect succeeds
    store.dispatch(
      new Users.ConnectSuccess({
        user: {
          id: user.username,
          name: 'Admin',
        } as any,
      } as any)
    );
    fixture.detectChanges();
    expect(DOM.loginButton.disabled).toBe(true);
    expect(DOM.loginButton.textContent.toLowerCase()).toContain(`logging in`);

    // if connect fails
    store.dispatch(new Users.ConnectError());
    fixture.detectChanges();
    expect(DOM.loginButton.disabled).toBe(false);
    expect(DOM.loginButton.textContent.toLowerCase()).toContain(`log in`);
    expect(DOM.errorTxt).toEqual(`Username and password do not match`);
  });
});

class MockActivatedRoute {
  constructor() {}

  snapshot = {
    queryParamMap: {
      get(param: string) {
        return param === 'previousUrl' ? 'some-previous-url-if-any' : null;
      },
    },
  };
}
