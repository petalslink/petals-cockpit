import { SERVICES_DOM, SERVICES_TREE_DOM } from '../support/services.dom';
import { WORKSPACE_DOM } from '../support/workspace.dom';

describe(`Service`, () => {
  beforeEach(() => {
    cy.visit(`/login`);
  });

  it(`should contain a services tree`, () => {
    cy.login('admin', 'admin');

    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Services`)
      .click();
    cy.get(SERVICES_TREE_DOM.navTree.navTreeServices);

    const servicesNames = cy.get(SERVICES_TREE_DOM.texts.servicesNames);

    const expectedServicesTree = [
      `http://namespace-example.fr/service/technique/version/1.0`,
      `Localpart0`,
      `Localpart1`,
      `http://namespace-example.fr/service/technique/version/2.0`,
      `Localpart2`,
      `http://namespace-example.fr/service/technique/version/3.0`,
      `Localpart3`,
      `Localpart4`,
    ];

    servicesNames.each(($item, index) =>
      cy.contains(expectedServicesTree[index])
    );
  });

  it(`should go to service details`, () => {
    cy.login('admin', 'admin');

    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Services`)
      .click();

    cy.getElementInServicesTree(`item-name`, `Localpart0`).click();

    cy.expectLocationToBe(`/workspaces/idWks0/services/idService0`);
  });
});
