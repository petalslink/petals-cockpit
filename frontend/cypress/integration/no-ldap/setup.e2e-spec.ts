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

import {
  badSetupUser,
  correctSetupToken,
  goneSetupToken,
} from '../../support/helper.const';
import { LOGIN_DOM } from '../../support/login.dom';
import { SETUP_DOM } from '../../support/setup.dom';

describe(`Setup`, () => {
  beforeEach(() => {
    cy.visit(`/setup`);
  });

  it(`should pre-fill the token field`, () => {
    cy.visit(`/setup?token=${correctSetupToken}`);

    cy
      .get(SETUP_DOM.inputs.token)
      .should('be.visible')
      .should('have.value', correctSetupToken);

    cy.get(SETUP_DOM.inputs.username).should('be.empty');

    cy.get(SETUP_DOM.inputs.password).should('be.empty');

    cy.get(SETUP_DOM.inputs.name).should('be.empty');

    cy.get(SETUP_DOM.buttons.submit).should('be.disabled');
  });

  it(`should add user and redirect to login page`, () => {
    cy.visit(`/setup?token=${correctSetupToken}`);

    cy
      .get(SETUP_DOM.inputs.username)
      .type('cpaul')
      .should('have.value', 'cpaul');

    cy
      .get(SETUP_DOM.inputs.password)
      .type('randompassword')
      .should('have.value', 'randompassword');

    cy
      .get(SETUP_DOM.inputs.name)
      .type('randomname')
      .should('have.value', 'randomname');

    cy
      .get(SETUP_DOM.buttons.submit)
      .should('be.enabled')
      .contains('Add')
      .click();

    cy.get(SETUP_DOM.messages.error.setupFailed).should('not.be.visible');

    cy.expectLocationToBe('/login');

    cy
      .get(LOGIN_DOM.messages.valid.setupSucceeded)
      .contains('User has been added successfully.')
      .should('be.visible');
  });

  it(`should be gone once it has been setup`, () => {
    cy.visit(`/setup?token=${goneSetupToken}`);

    cy.setupNoLdapUserAndExpectToFail(
      'cpaul',
      'randompassword',
      'randomname',
      'Petals Cockpit is already setup'
    );
  });

  it(`should have conflict if user already exists`, () => {
    cy.visit(`/setup?token=${correctSetupToken}`);

    cy.setupNoLdapUserAndExpectToFail(
      badSetupUser,
      'randompassword',
      'randomname',
      'Conflict'
    );
  });

  it(`should be forbidden with the wrong token`, () => {
    cy.visit(`/setup?token=badtoken`);

    cy.setupNoLdapUserAndExpectToFail(
      'cpaul',
      'randompassword',
      'randomname',
      'Invalid token'
    );
  });

  it(`should not allow to click if info is missing`, () => {
    cy.location().should(location => {
      expect(location.pathname).to.eq('/setup');
    });

    cy
      .get(SETUP_DOM.inputs.token)
      .should('be.visible')
      .should('be.empty');

    cy
      .get(SETUP_DOM.inputs.username)
      .should('be.visible')
      .should('be.empty')
      .type('cpaul')
      .should('have.value', 'cpaul');

    cy
      .get(SETUP_DOM.inputs.password)
      .should('be.visible')
      .should('be.empty')
      .type('pwd')
      .should('have.value', 'pwd');

    cy
      .get(SETUP_DOM.inputs.name)
      .should('be.visible')
      .should('be.empty')
      .type('cpaul')
      .should('have.value', 'cpaul');

    cy.get(SETUP_DOM.buttons.submit).should('be.disabled');

    cy
      .get(SETUP_DOM.inputs.token)
      .type('token')
      .should('have.value', 'token');

    cy.get(SETUP_DOM.buttons.submit).should('be.enabled');

    cy.get(SETUP_DOM.inputs.token).clear();

    cy.get(SETUP_DOM.buttons.submit).should('be.disabled');
  });

  it(`should have a required error when inputs are cleared`, () => {
    cy
      .get(SETUP_DOM.formFields.tokenFormField)
      .find(`mat-error`)
      .should('not.be.visible');

    cy
      .get(SETUP_DOM.formFields.usernameFormField)
      .find(`mat-error`)
      .should('not.be.visible');

    cy
      .get(SETUP_DOM.formFields.pwdFormField)
      .find(`mat-error`)
      .should('not.be.visible');

    cy
      .get(SETUP_DOM.formFields.nameFormField)
      .find(`mat-error`)
      .should('not.be.visible');

    cy
      .get(SETUP_DOM.inputs.token)
      .type('t')
      .clear();

    cy
      .get(SETUP_DOM.formFields.tokenFormField)
      .find(`mat-error`)
      .first()
      .contains('Required!')
      .should('be.visible');

    cy
      .get(SETUP_DOM.inputs.username)
      .type('u')
      .clear();

    cy
      .get(SETUP_DOM.formFields.usernameFormField)
      .find(`mat-error`)
      .last()
      .contains('Required!')
      .should('be.visible');

    cy
      .get(SETUP_DOM.inputs.password)
      .type('p')
      .clear();

    cy
      .get(SETUP_DOM.formFields.pwdFormField)
      .find(`mat-error`)
      .last()
      .contains('Required!')
      .should('be.visible');

    cy
      .get(SETUP_DOM.inputs.name)
      .type('n')
      .clear();

    cy
      .get(SETUP_DOM.formFields.nameFormField)
      .find(`mat-error`)
      .last()
      .contains('Required!')
      .should('be.visible');
  });

  it(`should toggle icon visibility of password and show pwd text in clear`, () => {
    cy
      .get(SETUP_DOM.inputs.password)
      .should('be.empty')
      .and('be.visible')
      .and('not.have.attr', 'type', 'text')
      .and('have.attr', 'type', 'password')
      .type('test');

    cy
      .get(SETUP_DOM.formFields.pwdFormField)
      .find(`fa-icon svg[data-icon=eye-slash]`)
      .should('be.visible');

    cy
      .get(SETUP_DOM.formFields.pwdFormField)
      .find(`fa-icon svg[data-icon=eye]`)
      .should('not.be.visible');

    cy.get(SETUP_DOM.icons.togglePwd).click();

    cy
      .get(SETUP_DOM.formFields.pwdFormField)
      .find(`fa-icon svg[data-icon=eye-slash]`)
      .should('not.be.visible');

    cy
      .get(SETUP_DOM.formFields.pwdFormField)
      .find(`fa-icon svg[data-icon=eye]`)
      .should('be.visible');

    cy
      .get(SETUP_DOM.inputs.password)
      .should('not.have.attr', 'type', 'password')
      .and('have.attr', 'type', 'text')
      .and('have.value', 'test')
      .and('be.visible');
  });
});
