import { ENDPOINT_OVERVIEW_DOM } from './endpoint.dom';

Cypress.Commands.add('getNameInEndpointLocation', (classe, name) => {
  // class can be: bus, container, component
  return cy.get(`.${classe}`).contains(name);
});

Cypress.Commands.add(
  'expectEdpInterfacesListToBe',
  listInterfacesLocalpartsNamespaces => {
    const listItemInterfaces = cy.get(
      ENDPOINT_OVERVIEW_DOM.listItem.itemInterfaces
    );

    listItemInterfaces.should(
      'have.length',
      listInterfacesLocalpartsNamespaces.length / 2
    );
    listItemInterfaces.each(($item, index) => {
      const item = cy.wrap($item);
      item.should('contain', listInterfacesLocalpartsNamespaces[index * 2]);
      item.should('contain', listInterfacesLocalpartsNamespaces[index * 2 + 1]);
    });
  }
);
