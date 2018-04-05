import { SERVICE_OVERVIEW_DOM } from './service.dom';

Cypress.Commands.add('expectServiceNamespaceToBe', serviceNamespace => {
  cy
    .get(SERVICE_OVERVIEW_DOM.texts.serviceNamespace)
    .contains(serviceNamespace);
});

Cypress.Commands.add(
  'expectInterfacesListToBe',
  listInterfacesLocalpartsNamespace => {
    const listItemInterfaces = cy.get(
      SERVICE_OVERVIEW_DOM.listItem.itemInterfaces
    );

    listItemInterfaces.should(
      'have.length',
      listInterfacesLocalpartsNamespace.length / 2
    );
    listItemInterfaces.each(($item, index) => {
      const item = cy.wrap($item);
      item.should('contain', listInterfacesLocalpartsNamespace[index * 2]);
      item.should('contain', listInterfacesLocalpartsNamespace[index * 2 + 1]);
    });
  }
);

Cypress.Commands.add('expectEndpointsListToBe', list => {
  const endpointsNames = cy.get(SERVICE_OVERVIEW_DOM.texts.endpointsNames);

  endpointsNames.should('have.length', list.length);
  endpointsNames.each(($item, index) => cy.wrap($item).contains(list[index]));
});
