import { SERVICES_DOM, SERVICE_LIST_DOM } from '../support/services.dom';
import { WORKSPACE_DOM } from '../support/workspace.dom';

describe(`Service`, () => {
  beforeEach(() => {
    cy.visit(`/login`);
  });

  it(`should have a list of services`, () => {
    cy.login('admin', 'admin');

    const tabServices = cy.get(WORKSPACE_DOM.tabs.tab).contains(`Services`);

    tabServices.click();

    const navList = cy.get(SERVICE_LIST_DOM.navList.navListServices);
    const servicesNames = cy.get(SERVICE_LIST_DOM.texts.servicesNames);

    const expectedServicesNames = [
      `{http://namespace-example.fr/service/technique/version/1.0}Localpart0`,
      `{http://namespace-example.fr/service/technique/version/1.0}Localpart1`,
      `{http://namespace-example.fr/service/technique/version/1.0}Localpart2`,
      `{http://namespace-example.fr/service/technique/version/1.0}Localpart3`,
      `{http://namespace-example.fr/service/technique/version/1.0}Localpart4`,
    ];

    servicesNames.each(($item, index) =>
      cy.contains(expectedServicesNames[index])
    );
  });
});
