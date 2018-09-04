import { SETUP_DOM } from '../support/setup.dom';
import {
  correctSetupToken,
  correctSetupUser,
  goneSetupToken,
  badSetupUser,
} from '../support/helper.const';

describe(`Setup Ldap Mode`, () => {
  beforeEach(() => {
    cy.visit(`/setup`);
  });

  it(`should select the first input of the setup form on desktop`, () => {
    cy.location().should(location => {
      expect(location.pathname).to.eq('/setup');
    });

    cy.get(SETUP_DOM.inputs.token).expectFocused();
  });

  // TODO: test inconsistently failing
  // see https://gitlab.com/linagora/petals-cockpit/issues/439
  // it.only(`shouldn't select the setup input of the setup form on mobile`, () => {
  //   cy.viewport(412, 732);
  //   cy.visit(`/setup`);

  //   cy
  //     .get(SETUP_DOM.inputs.token)
  //     .then(input => expect(input.hasFocus()).to.eq(false));
  // });

  it(`should pre-fill the token field`, () => {
    cy.visit(`/setup?token=${correctSetupToken}`);

    cy
      .get(SETUP_DOM.inputs.token)
      .should('be.visible')
      .should('have.value', correctSetupToken);

    cy.get(SETUP_DOM.inputs.username).should('be.empty');

    cy.get(SETUP_DOM.inputs.password).should('not.be.visible');

    cy.get(SETUP_DOM.inputs.name).should('not.be.visible');

    cy.get(SETUP_DOM.buttons.submit).should('be.disabled');
  });

  it(`should add user and redirect to login page`, () => {
    cy.visit(`/setup?token=${correctSetupToken}`);

    cy
      .get(SETUP_DOM.inputs.username)
      .type(correctSetupUser)
      .should('have.value', correctSetupUser);

    cy
      .get(SETUP_DOM.buttons.submit)
      .should('be.enabled')
      .contains('Add')
      // first click to add ldap user
      .click();

    cy.get(SETUP_DOM.messages.error.setupFailed).should('not.be.visible');

    cy
      .get(SETUP_DOM.buttons.submit)
      .should('be.enabled')
      .contains(`User added: click to login!`)
      // second click to confirm you want to log with the user well added
      .click();

    cy.expectLocationToBe('/login');
  });

  it(`should be gone once it has been setup`, () => {
    cy.visit(`/setup?token=${goneSetupToken}`);

    cy.setupUserAndExpectToFail('cpaul', 'Petals Cockpit is already setup');
  });

  it(`should have conflict if user already exists`, () => {
    cy.visit(`/setup?token=${correctSetupToken}`);

    cy.setupUserAndExpectToFail(badSetupUser, 'Conflict');
  });

  it(`should be forbidden with the wrong token`, () => {
    cy.visit(`/setup?token=badtoken`);

    cy.setupUserAndExpectToFail('cpaul', 'Invalid token');
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
      .should('be.empty');

    cy.get(SETUP_DOM.buttons.submit).should('be.disabled');

    cy
      .get(SETUP_DOM.inputs.token)
      .type('token')
      .should('have.value', 'token');

    cy.get(SETUP_DOM.buttons.submit).should('be.disabled');

    cy.get(SETUP_DOM.inputs.token).clear();

    cy
      .get(SETUP_DOM.inputs.username)
      .type('cpaul')
      .should('have.value', 'cpaul');

    cy.get(SETUP_DOM.buttons.submit).should('be.disabled');

    cy
      .get(SETUP_DOM.inputs.token)
      .type('token')
      .should('have.value', 'token');

    cy.get(SETUP_DOM.buttons.submit).should('be.enabled');

    cy
      .get(SETUP_DOM.inputs.token)
      .clear()
      .should('be.empty');
  });
});
