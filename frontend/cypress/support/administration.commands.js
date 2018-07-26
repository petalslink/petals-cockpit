import {
  ADMINISTRATION_DOM,
  ADD_EDIT_USER_DOM,
  ADD_LDAP_USER_DOM,
} from './administration.dom';

Cypress.Commands.add(
  'expectLdapSearchUsersListToBe',
  (listUserNames, listUserIds) => {
    const ldapUserNames = cy.get(ADD_LDAP_USER_DOM.texts.ldapUserNames);

    ldapUserNames.should('have.length', listUserNames.length);

    ldapUserNames.each(($item, index) => {
      cy.wrap($item).contains(listUserNames[index]);
    });

    const ldapUserIds = cy.get(ADD_LDAP_USER_DOM.texts.ldapUserIds);

    ldapUserIds.should('have.length', listUserIds.length);

    ldapUserIds.each(($item, index) => {
      cy.wrap($item).contains(listUserIds[index]);
    });

    cy
      .get(ADD_LDAP_USER_DOM.texts.ldapUsers)
      .find(`mat-icon`)
      .contains('add_box')
      .should('be.visible');
  }
);

Cypress.Commands.add('expectHighlightedUserIdToBe', listIds => {
  const listUserIds = cy.get(ADD_LDAP_USER_DOM.texts.ldapUserIds);

  listUserIds.each(($item, index) => cy.wrap($item).contains(listIds[index]));
});

Cypress.Commands.add('expectHighlightedUserNameToBe', listNames => {
  const ldapUserNames = cy.get(ADD_LDAP_USER_DOM.texts.ldapUserNames);

  ldapUserNames.each(($item, index) =>
    cy.wrap($item).contains(listNames[index])
  );
});

Cypress.Commands.add('expectLdapUsersListToBe', (titleIds, titleNames) => {
  const titleUserIds = cy.get(ADMINISTRATION_DOM.texts.titleUserIds);

  titleUserIds.should('have.length', titleIds.length);

  titleUserIds.each(($item, index) => {
    cy.wrap($item).contains(titleIds[index]);
  });

  const titleUserNames = cy.get(ADMINISTRATION_DOM.texts.titleUserNames);

  titleUserNames.should('have.length', titleNames.length);

  titleUserNames.each(($item, index) => {
    cy.wrap($item).contains(titleNames[index]);
  });
});

Cypress.Commands.add('expectUsersListToBe', (titleIds, titleNames) => {
  const titleUserIds = cy.get(ADD_EDIT_USER_DOM.texts.titleUserIds);

  titleUserIds.should('have.length', titleIds.length);

  titleUserIds.each(($item, index) => {
    cy.wrap($item).contains(titleIds[index]);
  });

  const titleUserNames = cy.get(ADD_EDIT_USER_DOM.texts.titleUserNames);

  titleUserNames.should('have.length', titleNames.length);

  titleUserNames.each(($item, index) => {
    cy.wrap($item).contains(titleNames[index]);
  });
});
