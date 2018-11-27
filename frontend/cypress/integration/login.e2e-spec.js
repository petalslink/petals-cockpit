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

    // within our mocks, the last workspace of admin user is idWks0
    cy.expectLocationToBe(`/workspaces/idWks0`);
  });

  it(`should redirect to original url after login`, () => {
    cy.visit(`/workspaces/idWks1`);
    cy.login('admin', 'admin');
    cy.expectLocationToBe(`/workspaces/idWks1`);
  });

  it(`should select the first input of the login form on desktop`, () => {
    const usernameInput = cy.get(LOGIN_DOM.inputs.username);

    usernameInput.expectFocused();
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
      .first()
      .contains('Required!')
      .should('be.visible');

    cy
      .get(LOGIN_DOM.inputs.hiddenPassword)
      .type('p')
      .clear();

    cy
      .get(LOGIN_DOM.formFields.usernameFormField)
      .find(`mat-error`)
      .last()
      .contains('Required!')
      .should('be.visible');
  });

  it(`should toggle icon visibility of password and show pwd text in clear`, () => {
    cy.get(LOGIN_DOM.inputs.shownPassword).should('not.be.visible');

    cy
      .get(LOGIN_DOM.inputs.hiddenPassword)
      .should('be.empty')
      .and('be.visible')
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

    cy.get(LOGIN_DOM.inputs.hiddenPassword).should('not.be.visible');

    cy
      .get(LOGIN_DOM.inputs.shownPassword)
      .should('have.value', 'test')
      .and('be.visible');
  });

  // TODO: test inconsistently failing
  // see https://gitlab.com/linagora/petals-cockpit/issues/439
  // it(`shouldn't select the first input of the login form on mobile`, () => {
  //   cy.viewport(412, 732);
  //   cy.visit(`/login`);

  //   cy.document().then(document => expect(document.hasFocus()).to.eq(false));
  // });
});
