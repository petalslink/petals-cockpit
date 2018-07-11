import {
  ADMINISTRATION_DOM,
  ADD_EDIT_USER_DOM,
  ADD_LDAP_USER_DOM,
} from './administration.dom';

Cypress.Commands.add(
  'expectLdapUsersListToBe',
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
  }
);
