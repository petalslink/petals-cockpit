import {
  ADMINISTRATION_DOM,
  ADD_LDAP_USER_DOM,
  ADD_EDIT_USER_DOM,
} from '../support/administration.dom';
import { WORKSPACE_DOM } from '../support/workspace.dom';
import { PETALS_COCKPIT_DOM } from '../support/petals-cockpit.dom';
import { MESSAGE_DOM } from '../support/message.dom';

describe(`Administration`, () => {
  beforeEach(() => {
    cy.visit(`/login`);
  });

  describe(`For admin`, () => {
    beforeEach(() => {
      cy.login('admin', 'admin');

      cy.get(PETALS_COCKPIT_DOM.buttons.goToAdminPage).click();
    });

    it(`should open the administration page`, () => {
      cy.expectLocationToBe(`/admin`);

      cy.get(ADMINISTRATION_DOM.texts.title).contains('Administration');

      cy.expectMessageToBe(
        MESSAGE_DOM.texts.msgDetails,
        'info',
        'As an administrator, you can ADD, EDIT, and DELETE any user.'
      );
    });

    it(`should open add a new user`, () => {
      cy.get(ADMINISTRATION_DOM.expPanel.expPanelAddUser).click();

      cy
        .get(ADD_EDIT_USER_DOM.inputs.username)
        .should('be.visible')
        .should('be.empty')
        .not('.required');
      cy
        .get(ADD_EDIT_USER_DOM.inputs.name)
        .should('be.visible')
        .should('be.empty')
        .not('.required');
      cy
        .get(ADD_EDIT_USER_DOM.inputs.password)
        .should('be.visible')
        .should('be.empty')
        .not('.required');

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.buttons.submitBtn)
        .should('be.disabled');
    });

    it(`should close and clear on cancel`, () => {
      cy.get(ADMINISTRATION_DOM.expPanel.expPanelAddUser).click();

      cy.get(ADD_EDIT_USER_DOM.inputs.username).type('Username');

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.inputs.name)
        .type('Name')
        .clear();

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.inputs.password)
        .type('Password');

      cy
        .get(ADD_EDIT_USER_DOM.texts.matError)
        .contains('Required')
        .should('have.class', 'mat-error');

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.buttons.cancelBtn)
        .click();

      cy.get(ADD_EDIT_USER_DOM.inputs.username).should('not.be.visible');

      cy.get(ADMINISTRATION_DOM.expPanel.expPanelAddUser).click();

      cy.get(ADD_EDIT_USER_DOM.inputs.username).should('be.empty');

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.inputs.name)
        .should('be.empty');

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.inputs.password)
        .should('be.empty');
    });

    // TODO: finish migration of protractor tests
    // it(`should add and delete a user`, () => {});

    // TODO: finish migration of protractor tests
    // it(`should edit a user`, () => {});

    // TODO: finish migration of protractor tests
    // it(`should not show a user-name in panel list users`, () => {});
  });

  describe(`For adminldap`, () => {
    beforeEach(() => {
      cy.login('adminldap', 'adminldap');

      cy.get(PETALS_COCKPIT_DOM.buttons.goToAdminPage).click();
    });

    it(`should open the administration page`, () => {
      cy.expectLocationToBe(`/admin`);

      cy.get(ADMINISTRATION_DOM.texts.title).contains('Administration');

      cy.expectMessageToBe(
        MESSAGE_DOM.texts.msgDetails,
        'info',
        'As an administrator, you can ADD and DELETE users from LDAP.'
      );
    });

    it(`should open add ldap user with always empty search`, () => {
      cy.get(ADMINISTRATION_DOM.expPanel.expPanelAddUser).click();

      cy
        .get(ADD_LDAP_USER_DOM.inputs.userSearchCtrl)
        .should('be.visible')
        .should('be.empty')
        .not('.required');
    });

    it(`should display required message when search is cleared`, () => {
      cy.get(ADMINISTRATION_DOM.expPanel.expPanelAddUser).click();

      cy
        .get(ADD_LDAP_USER_DOM.inputs.userSearchCtrl)
        .type(`Yoann`)
        .clear();

      cy
        .get(ADD_LDAP_USER_DOM.texts.matError)
        .contains('Required')
        .should('have.class', 'mat-error');

      cy.get(ADD_LDAP_USER_DOM.inputs.userSearchCtrl).type(`Yoann`);

      // we make sure that when we change the page and we come back on it, we clean the store correctly
      cy.get(PETALS_COCKPIT_DOM.buttons.userAvatar).click();

      cy.get(PETALS_COCKPIT_DOM.buttons.goToAdminPage).click();

      cy.get(ADMINISTRATION_DOM.expPanel.expPanelAddUser).click();

      cy
        .get(ADD_LDAP_USER_DOM.inputs.userSearchCtrl)
        .should('be.empty')
        .click();

      cy.get(ADD_LDAP_USER_DOM.texts.ldapUserIds).should('have.length', 0);

      cy.get(ADD_LDAP_USER_DOM.texts.ldapUserNames).should('have.length', 0);
    });

    it(`should display filtered list according to search string`, () => {
      cy.get(ADMINISTRATION_DOM.expPanel.expPanelAddUser).click();

      cy
        .get(ADD_LDAP_USER_DOM.inputs.userSearchCtrl)
        .should('be.empty')
        .type(`e`)
        .wait(300);

      cy
        .get(`.msg-option`)
        .contains('7 people are matching this search.')
        .should('be.visible');

      cy.expectLdapUsersListToBe(expected7LdapUsersName, expected7LdapUsersIds);

      // Add a wait of  300ms to have a debounceTime at each new entrance
      cy
        .get(ADD_LDAP_USER_DOM.inputs.userSearchCtrl)
        .type(`r`)
        .wait(300);

      cy
        .get(`.msg-option`)
        .contains('3 people are matching this search.')
        .should('be.visible');

      cy.expectLdapUsersListToBe(expected3LdapUsersName, expected3LdapUsersIds);

      cy
        .get(ADD_LDAP_USER_DOM.inputs.userSearchCtrl)
        .type(`a`)
        .wait(300);

      cy
        .get(`.msg-option`)
        .contains('There is no user found.')
        .should('be.visible');

      cy
        .get(ADD_LDAP_USER_DOM.inputs.userSearchCtrl)
        .clear()
        .should('be.empty');

      cy
        .get(ADD_LDAP_USER_DOM.texts.matError)
        .contains('Required')
        .should('have.class', 'mat-error');

      cy
        .get(ADD_LDAP_USER_DOM.inputs.userSearchCtrl)
        .type(`ert`)
        .wait(300);

      cy
        .get(`.msg-option`)
        .contains('One person is matching this search.')
        .should('be.visible');

      cy.expectLdapUsersListToBe(['Yoann HOUPERT'], ['yhoupert']);

      cy.get(ADD_LDAP_USER_DOM.inputs.userSearchCtrl).not('.required');
    });
  });

  it(`should not be visible to non-admin`, () => {
    cy.login('vnoel', 'vnoel');

    cy.get(PETALS_COCKPIT_DOM.buttons.goToAdminPage).should('not.be.visible');
  });

  it(`should show a warning to non-admin`, () => {
    cy.visit(`/admin`).login('vnoel', 'vnoel');

    cy.expectMessageToBe(
      MESSAGE_DOM.texts.msgDetails,
      'warning',
      'You are not an administrator.'
    );
  });

  // list of users already added
  const expectedUsers = [
    ['admin', 'Administrator'],
    ['adminldap', 'Administrator LDAP'],
    ['bescudie', 'Bertrand ESCUDIE'],
    ['cchevalier', 'Christophe CHEVALIER'],
    ['cdeneux', 'Christophe DENEUX'],
    ['mrobert', 'Maxime ROBERT'],
    ['vnoel', 'Victor NOEL'],
  ];

  // list of users ldap
  const expected7LdapUsers = [
    ['alagane', 'Alexandre LAGANE'],
    ['psouquet', 'Pierre SOUQUET'],
    ['vzurczak', 'Vincent ZURCZAK'],
    ['sgarcia', 'Sébastien GARCIA'],
    ['jcabannes', 'Jordy CABANNES'],
    ['avigier', 'Albin VIGIER'],
    ['yhoupert', 'Yoann HOUPERT'],
  ];

  const expected3LdapUsers = [
    ['psouquet', 'Pierre SOUQUET'],
    ['avigier', 'Albin VIGIER'],
    ['yhoupert', 'Yoann HOUPERT'],
  ];

  // list ids of users ldap
  const expected7LdapUsersIds = [
    'alagane',
    'psouquet',
    'vzurczak',
    'sgarcia',
    'jcabannes',
    'avigier',
    'yhoupert',
  ];

  const expected3LdapUsersIds = ['psouquet', 'avigier', 'yhoupert'];

  // list names of users ldap
  const expected7LdapUsersName = [
    'Alexandre LAGANE',
    'Pierre SOUQUET',
    'Vincent ZURCZAK',
    'Sébastien GARCIA',
    'Jordy CABANNES',
    'Albin VIGIER',
    'Yoann HOUPERT',
  ];

  const expected3LdapUsersName = [
    'Pierre SOUQUET',
    'Albin VIGIER',
    'Yoann HOUPERT',
  ];
});
