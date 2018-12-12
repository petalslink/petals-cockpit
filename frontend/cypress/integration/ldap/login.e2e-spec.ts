/**
 * Copyright (C) 2018 Linagora
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

import { LOGIN_DOM } from '../../support/login.dom';

describe(`Login`, () => {
  beforeEach(() => {
    cy.visit(`/login`);
  });

  it(`should be redirected to login if a user is trying to access a protected route without being logged`, () => {
    cy.location().should(location => {
      expect(location.pathname).to.eq('/login');
    });

    // protected URL
    cy.visit(`/workspaces/idWks0`);
    cy.location().should(location => {
      expect(location.pathname).to.eq('/login');
      expect(decodeURIComponent(location.search)).to.eq(
        '?previousUrl=/workspaces/idWks0'
      );
    });
  });

  it(`should not login if user/pwd do not match`, () => {
    cy.login('admin', 'randomPasswordNotWorking', false);
  });

  it(`should redirect to last workspace if login/pw match`, () => {
    cy.login('admin', 'admin');

    // within our mocks, the last workspace of admin user is idWks0
    cy.expectLocationToBe(`/workspaces/idWks0`);
  });

  it(`should redirect to original url after login`, () => {
    cy.visit(`/workspaces/idWks1`);
    cy.login('admin', 'admin');
    cy.expectLocationToBe(`/workspaces/idWks1`);
  });

  it(`should select the first input of the login form on desktop`, () => {
    cy.get(LOGIN_DOM.inputs.username).expectFocused();
  });

  it(`should have a required error when inputs are cleared`, () => {
    cy
      .get(LOGIN_DOM.formFields.usernameFormField)
      .find(`mat-error`)
      .should('not.be.visible');

    cy
      .get(LOGIN_DOM.formFields.pwdFormField)
      .find(`mat-error`)
      .should('not.be.visible');

    cy
      .get(LOGIN_DOM.inputs.username)
      .type('u')
      .clear();

    cy
      .get(LOGIN_DOM.formFields.usernameFormField)
      .find(`mat-error`)
      .last()
      .contains('Required!')
      .should('be.visible');

    cy
      .get(LOGIN_DOM.inputs.password)
      .type('p')
      .clear();

    cy
      .get(LOGIN_DOM.formFields.pwdFormField)
      .find(`mat-error`)
      .last()
      .contains('Required!')
      .should('be.visible');
  });

  it(`should toggle icon visibility of password and show pwd text in clear`, () => {
    cy
      .get(LOGIN_DOM.inputs.password)
      .should('be.empty')
      .and('be.visible')
      .and('not.have.attr', 'type', 'text')
      .and('have.attr', 'type', 'password')
      .type('test');

    cy
      .get(LOGIN_DOM.formFields.pwdFormField)
      .find(`fa-icon svg[data-icon=eye-slash]`)
      .should('be.visible');

    cy
      .get(LOGIN_DOM.formFields.pwdFormField)
      .find(`fa-icon svg[data-icon=eye]`)
      .should('not.be.visible');

    cy.get(LOGIN_DOM.icons.togglePwd).click();

    cy
      .get(LOGIN_DOM.formFields.pwdFormField)
      .find(`fa-icon svg[data-icon=eye-slash]`)
      .should('not.be.visible');

    cy
      .get(LOGIN_DOM.formFields.pwdFormField)
      .find(`fa-icon svg[data-icon=eye]`)
      .should('be.visible');

    cy
      .get(LOGIN_DOM.inputs.password)
      .should('not.have.attr', 'type', 'password')
      .and('have.attr', 'type', 'text')
      .and('have.value', 'test')
      .and('be.visible');
  });
});
