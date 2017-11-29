import { LOGIN_DOM } from '../support/login.dom';

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
    cy.location().should(location =>
      // within our mocks, the last workspace of admin user is idWks0
      expect(location.pathname).to.eq('/workspaces/idWks0')
    );
  });

  it(`should redirect to original url after login`, () => {
    cy.visit(`/workspaces/idWks1`);
    cy.login('admin', 'admin');
    cy
      .location()
      .should(location =>
        expect(location.pathname).to.eq('/workspaces/idWks1')
      );
  });

  it(`should select the first input of the login form on desktop`, () => {
    const usernameInput = cy.get(LOGIN_DOM.inputs.username);

    usernameInput.expectFocused();
  });

  it(`shouldn't select the first input of the login form on mobile`, () => {
    cy.viewport(412, 732);
    cy.visit(`/login`);

    cy.document().then(document => expect(document.hasFocus()).to.eq(false));
  });
});
