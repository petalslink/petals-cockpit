import {
  ADMINISTRATION_DOM,
  ADD_LDAP_USER_DOM,
  ADD_EDIT_USER_DOM,
} from '../../support/administration.dom';
import { WORKSPACE_DOM } from '../../support/workspace.dom';
import { PETALS_COCKPIT_DOM } from '../../support/petals-cockpit.dom';
import { MESSAGE_DOM } from '../../support/message.dom';

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

      cy.expectUsersListToBe(expectedUsersIds, expectedUsersNames);

      cy.expectMessageToBe(
        MESSAGE_DOM.texts.msgDetails,
        'info',
        'As an administrator, you can ADD, EDIT, and DELETE any user.'
      );
    });

    it(`should open and close add a new user with always empty form fieds`, () => {
      cy.get(ADMINISTRATION_DOM.expPanel.expPanelAddUser).click();

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.inputs.username)
        .should('be.visible')
        .should('be.empty')
        .not('.required');
      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.inputs.name)
        .should('be.visible')
        .should('be.empty')
        .not('.required');
      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.inputs.password)
        .should('be.visible')
        .should('be.empty')
        .not('.required');

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.buttons.submitBtn)
        .should('be.disabled');

      // should reset add form user
      cy
        .get(ADMINISTRATION_DOM.expPanel.expPanelAddUser)
        .click()
        .click();

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.inputs.username)
        .should('be.empty');

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.inputs.name)
        .should('be.empty');

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.inputs.password)
        .should('be.empty');
    });

    it(`should close and clear on cancel`, () => {
      cy.get(ADMINISTRATION_DOM.expPanel.expPanelAddUser).click();

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.inputs.username)
        .type('Username');

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

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.inputs.username)
        .should('not.be.visible');

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.inputs.name)
        .should('not.be.visible');

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.inputs.password)
        .should('not.be.visible');

      cy.get(ADMINISTRATION_DOM.expPanel.expPanelAddUser).click();

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.inputs.username)
        .should('be.empty')
        .and('be.visible');
      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.inputs.name)
        .should('be.empty')
        .and('be.visible');
      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.inputs.password)
        .should('be.empty')
        .and('be.visible');
    });

    it(`should open and close edit user with always empty form fieds`, () => {
      // open edit bescudie
      cy
        .get(ADD_EDIT_USER_DOM.texts.titleUserIds)
        .contains('bescudie')
        .click();

      cy
        .get(`.exp-pnl-user-bescudie`)
        .find(ADD_EDIT_USER_DOM.inputs.username)
        .should('not.be.visible');

      cy
        .get(`.exp-pnl-user-bescudie`)
        .find(ADD_EDIT_USER_DOM.inputs.name)
        .should('have.value', 'Bertrand ESCUDIE')
        .and('be.visible');

      cy
        .get(`.exp-pnl-user-bescudie`)
        .find(ADD_EDIT_USER_DOM.inputs.password)
        .should('be.empty')
        .and('be.visible');

      cy
        .get(`.exp-pnl-user-bescudie`)
        .find(ADD_EDIT_USER_DOM.buttons.cancelBtn)
        .should('contain', 'Cancel')
        .and('be.enabled')
        .and('be.visible');

      cy
        .get(`.exp-pnl-user-bescudie`)
        .find(ADD_EDIT_USER_DOM.buttons.deleteBtn)
        .should('contain', 'Delete')
        .and('be.enabled')
        .and('be.visible');

      cy
        .get(`.exp-pnl-user-bescudie`)
        .find(ADD_EDIT_USER_DOM.buttons.submitBtn)
        .should('contain', 'Save')
        .and('be.enabled')
        .and('be.visible');

      // clean form fields
      cy
        .get(`.exp-pnl-user-bescudie`)
        .find(ADD_EDIT_USER_DOM.inputs.name)
        .clear();

      cy
        .get(`.exp-pnl-user-bescudie`)
        .find(ADD_EDIT_USER_DOM.inputs.password)
        .clear();

      cy
        .get(`.exp-pnl-user-bescudie`)
        .find(ADD_EDIT_USER_DOM.buttons.submitBtn)
        .should('be.disabled')
        .and('be.visible');

      // the previous panel should have been closed
      // open edit admin
      cy
        .get(ADD_EDIT_USER_DOM.texts.titleUserIds)
        .contains('admin')
        .click();

      cy
        .get(`.exp-pnl-user-bescudie`)
        .find(ADD_EDIT_USER_DOM.inputs.name)
        .should('not.be.visible');

      cy
        .get(`.exp-pnl-user-bescudie`)
        .find(ADD_EDIT_USER_DOM.inputs.password)
        .should('not.be.visible');

      cy
        .get(`.exp-pnl-user-bescudie`)
        .find(ADD_EDIT_USER_DOM.buttons.cancelBtn)
        .should('not.be.visible');

      cy
        .get(`.exp-pnl-user-bescudie`)
        .find(ADD_EDIT_USER_DOM.buttons.deleteBtn)
        .should('not.be.visible');

      cy
        .get(`.exp-pnl-user-bescudie`)
        .find(ADD_EDIT_USER_DOM.buttons.submitBtn)
        .should('not.be.visible');

      cy
        .get(`.exp-pnl-user-admin`)
        .find(ADD_EDIT_USER_DOM.inputs.name)
        .should('have.value', 'Administrator')
        .and('be.visible');

      cy
        .get(`.exp-pnl-user-admin`)
        .find(ADD_EDIT_USER_DOM.inputs.password)
        .should('be.empty')
        .and('be.visible');

      cy
        .get(`.exp-pnl-user-admin`)
        .find(ADD_EDIT_USER_DOM.buttons.cancelBtn)
        .should('contain', 'Cancel')
        .and('be.enabled')
        .and('be.visible');

      // the current user can't delete itself
      cy
        .get(`.exp-pnl-user-admin`)
        .find(ADD_EDIT_USER_DOM.buttons.deleteBtn)
        .should('contain', 'Delete')
        .and('be.disabled')
        .and('be.visible');

      cy
        .get(`.exp-pnl-user-admin`)
        .find(ADD_EDIT_USER_DOM.buttons.submitBtn)
        .should('contain', 'Save')
        .and('be.enabled')
        .and('be.visible');

      // the previous panel should have been closed
      // open edit bescudie
      cy
        .get(ADD_EDIT_USER_DOM.texts.titleUserIds)
        .contains('bescudie')
        .click();

      // should have the same starting information that was already saved
      cy
        .get(`.exp-pnl-user-bescudie`)
        .find(ADD_EDIT_USER_DOM.inputs.name)
        .should('have.value', 'Bertrand ESCUDIE')
        .and('be.visible');

      cy
        .get(`.exp-pnl-user-bescudie`)
        .find(ADD_EDIT_USER_DOM.inputs.password)
        .should('be.empty')
        .and('be.visible');
    });

    it(`should add and delete a user`, () => {
      cy.get(`.exp-pnl-add-user`).should('not.have.class', 'mat-expanded');

      cy.get(ADMINISTRATION_DOM.expPanel.expPanelAddUser).click();

      cy.get(`.exp-pnl-add-user`).should('have.class', 'mat-expanded');

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.inputs.username)
        .type('alagane');

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.buttons.submitBtn)
        .should('be.disabled');

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.inputs.name)
        .type('Alexandre LAGANE');

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.buttons.submitBtn)
        .should('be.disabled');

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.inputs.password)
        .type('This is awesome');

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.buttons.submitBtn)
        .should('be.enabled')
        .click();

      cy.get(`.exp-pnl-add-user`).should('not.have.class', 'mat-expanded');

      cy.expectLdapUsersListToBe(
        expectedUsersIdsUpdated,
        expectedUsersNamesUpdated
      );

      // open edit alagane
      cy
        .get(ADD_EDIT_USER_DOM.texts.titleUserIds)
        .contains('alagane')
        .click();

      cy.get(`.exp-pnl-user-alagane`).should('have.class', 'mat-expanded');

      cy
        .get(`.exp-pnl-user-alagane`)
        .find(ADD_EDIT_USER_DOM.inputs.name)
        .should('have.value', 'Alexandre LAGANE')
        .and('be.visible');

      cy
        .get(`.exp-pnl-user-alagane`)
        .find(ADD_EDIT_USER_DOM.inputs.password)
        .should('be.empty')
        .and('be.visible');

      cy
        .get(`.exp-pnl-user-alagane`)
        .find(ADD_EDIT_USER_DOM.buttons.deleteBtn)
        .click();

      cy.get(`.exp-pnl-user-alagane`).should('not.have.class', 'mat-expanded');

      cy.expectLdapUsersListToBe(expectedUsersIds, expectedUsersNames);
    });

    it(`should edit a user`, () => {
      // open edit vnoel
      cy
        .get(ADD_EDIT_USER_DOM.texts.titleUserIds)
        .contains('vnoel')
        .click();

      cy.get(`.exp-pnl-user-vnoel`).should('have.class', 'mat-expanded');

      cy
        .get(`.exp-pnl-user-vnoel`)
        .find(ADD_EDIT_USER_DOM.inputs.name)
        .should('have.value', 'Victor NOEL')
        .clear()
        .type('Victor NONO');

      cy
        .get(`.exp-pnl-user-vnoel`)
        .find(ADD_EDIT_USER_DOM.buttons.submitBtn)
        .click();

      cy.get(`.exp-pnl-user-vnoel`).should('not.have.class', 'mat-expanded');

      cy
        .get(ADMINISTRATION_DOM.panel.panelListUsers)
        .find(`.exp-pnl-user-vnoel`)
        .should('contain', 'Victor NONO');
    });

    it(`should not show a user-name in panel list users`, () => {
      cy.expectLdapUsersListToBe(expectedUsersIds, expectedUsersNames);

      cy.viewport(412, 732);

      cy.expectLdapUsersListToBe(expectedUsersIds, '');
    });
  });

  describe(`For adminldap`, () => {
    beforeEach(() => {
      cy.login('adminldap', 'adminldap');

      cy.get(PETALS_COCKPIT_DOM.buttons.goToAdminPage).click();
    });

    it(`should open the administration page`, () => {
      cy.expectLocationToBe(`/admin`);

      cy.get(ADMINISTRATION_DOM.texts.title).contains('Administration');

      cy.expectUsersListToBe(expectedUsersIds, expectedUsersNames);

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
        .contains('7 users are matching this search.')
        .should('be.visible');

      cy.expectLdapSearchUsersListToBe(
        expected7LdapUsersNames,
        expected7LdapUsersIds
      );

      // Add a wait of  300ms to have a debounceTime at each new entrance
      cy
        .get(ADD_LDAP_USER_DOM.inputs.userSearchCtrl)
        .type(`r`)
        .wait(300);

      cy
        .get(`.msg-option`)
        .contains('3 users are matching this search.')
        .should('be.visible');

      cy.expectLdapSearchUsersListToBe(
        expected3LdapUsersNames,
        expected3LdapUsersIds
      );

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
        .contains('1 user is matching this search.')
        .should('be.visible');

      cy.expectLdapSearchUsersListToBe(['Yoann HOUPERT'], ['yhoupert']);

      cy.get(ADD_LDAP_USER_DOM.inputs.userSearchCtrl).not('.required');
    });

    it(`should apply highlight class when search found`, () => {
      cy.get(ADMINISTRATION_DOM.expPanel.expPanelAddUser).click();

      // search user highlight id
      cy
        .get(ADD_LDAP_USER_DOM.inputs.userSearchCtrl)
        .should('be.empty')
        .type(`alagane`)
        .wait(300);

      cy.expectLdapSearchUsersListToBe(['Alexandre LAGANE'], ['alagane']);

      cy.expectHighlightedUserIdToBe([`alagane`]).should('have.class', 'bold');

      // search user highlight name
      cy
        .get(ADD_LDAP_USER_DOM.inputs.userSearchCtrl)
        .clear()
        .should('be.empty');
      cy
        .get(ADD_LDAP_USER_DOM.inputs.userSearchCtrl)
        .type(`Alexandre`)
        .wait(300);

      cy.expectLdapSearchUsersListToBe(['Alexandre LAGANE'], ['alagane']);

      cy
        .expectHighlightedUserNameToBe([`Alexandre`])
        .should('have.class', 'bold');

      // search user highlight name and id
      cy
        .get(ADD_LDAP_USER_DOM.inputs.userSearchCtrl)
        .clear()
        .should('be.empty');

      cy
        .get(ADD_LDAP_USER_DOM.inputs.userSearchCtrl)
        .type(`aL`)
        .wait(300);

      cy.expectLdapSearchUsersListToBe(
        ['Alexandre LAGANE', 'Albin VIGIER'],
        ['alagane', 'avigier']
      );

      cy
        .expectHighlightedUserNameToBe([`Al`, `Al`])
        .should('have.class', 'bold');

      cy.get(`.ldap-user-id .bold`).should('contain', 'al');

      cy
        .get(`.ldap-user-id`)
        .contains('avigier')
        .should('not.have.class', 'bold');
    });

    it(`should add ldap user when item is selected`, () => {
      cy.expectLdapUsersListToBe(expectedUsersIds, expectedUsersNames);

      cy.get(ADMINISTRATION_DOM.expPanel.expPanelAddUser).click();

      cy
        .get(ADD_LDAP_USER_DOM.inputs.userSearchCtrl)
        .should('be.empty')
        .type(`alexandre`)
        .wait(300);

      cy
        .expectLdapSearchUsersListToBe(['Alexandre LAGANE'], ['alagane'])
        .click();

      cy.expectLdapUsersListToBe(
        expectedUsersIdsUpdated,
        expectedUsersNamesUpdated
      );

      cy
        .get(ADD_LDAP_USER_DOM.inputs.userSearchCtrl)
        .should('be.empty')
        .type(`alexandre`)
        .wait(300);

      cy
        .get(`.msg-option`)
        .contains('There is no user found.')
        .should('be.visible');
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
  const expectedLdapUsersList = [
    ['admin', 'Administrator'],
    ['adminldap', 'Administrator LDAP'],
    ['bescudie', 'Bertrand ESCUDIE'],
    ['cchevalier', 'Christophe CHEVALIER'],
    ['cdeneux', 'Christophe DENEUX'],
    ['mrobert', 'Maxime ROBERT'],
    ['vnoel', 'Victor NOEL'],
  ];

  const expectedUsersIds = [
    'admin',
    'adminldap',
    'bescudie',
    'cchevalier',
    'cdeneux',
    'mrobert',
    'vnoel',
  ];

  const expectedUsersNames = [
    'Administrator',
    'Administrator LDAP',
    'Bertrand ESCUDIE',
    'Christophe CHEVALIER',
    'Christophe DENEUX',
    'Maxime ROBERT',
    'Victor NOEL',
  ];

  // new list of users added

  const expectedUsersIdsUpdated = [
    'admin',
    'adminldap',
    'alagane',
    'bescudie',
    'cchevalier',
    'cdeneux',
    'mrobert',
    'vnoel',
  ];

  const expectedUsersNamesUpdated = [
    'Administrator',
    'Administrator LDAP',
    'Alexandre LAGANE',
    'Bertrand ESCUDIE',
    'Christophe CHEVALIER',
    'Christophe DENEUX',
    'Maxime ROBERT',
    'Victor NOEL',
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
  const expected7LdapUsersNames = [
    'Alexandre LAGANE',
    'Pierre SOUQUET',
    'Vincent ZURCZAK',
    'Sébastien GARCIA',
    'Jordy CABANNES',
    'Albin VIGIER',
    'Yoann HOUPERT',
  ];

  const expected3LdapUsersNames = [
    'Pierre SOUQUET',
    'Albin VIGIER',
    'Yoann HOUPERT',
  ];
});
