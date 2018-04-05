import { INTERFACE_OVERVIEW_DOM } from './interface.dom';

Cypress.Commands.add('expectInterfaceNamespaceToBe', interfaceNamespace => {
  cy
    .get(INTERFACE_OVERVIEW_DOM.texts.interfaceNamespace)
    .contains(interfaceNamespace);
});

Cypress.Commands.add(
  'expectServicesListToBe',
  listServicesLocalpartsNamespace => {
    const listItemServices = cy.get(
      INTERFACE_OVERVIEW_DOM.listItem.itemServices
    );

    listItemServices.should(
      'have.length',
      listServicesLocalpartsNamespace.length / 2
    );
    listItemServices.each(($item, index) => {
      const item = cy.wrap($item);
      item.should('contain', listServicesLocalpartsNamespace[index * 2]);
      item.should('contain', listServicesLocalpartsNamespace[index * 2 + 1]);
    });
  }
);

Cypress.Commands.add('expectItfEndpointsListToBe', list => {
  const endpointsNames = cy.get(INTERFACE_OVERVIEW_DOM.texts.endpointsNames);

  endpointsNames.should('have.length', list.length);
  endpointsNames.each(($item, index) => cy.wrap($item).contains(list[index]));
});
