import { PETALS_DOM, PETALS_TREE_DOM, BIP_DOM } from '../support/petals.dom';
import { WORKSPACE_DOM } from '../support/workspace.dom';
import { MESSAGE_DOM } from '../support/message.dom';

describe(`Petals`, () => {
  const expectedTreeNames = [
    `Bus 0`,
    `Cont 0`,
    `Components`,
    `Comp 0`,
    `SU 0`,
    `SU 2`,
    `Comp 1`,
    `SU 1`,
    `SU 3`,
    `Comp 2`,
    `Service Assemblies`,
    `SA 0`,
    `SA 1`,
    `SA 2`,
    `Shared Libraries`,
    `SL 0`,
    `Cont 1`,
    `Components`,
    `Comp 3`,
    `SU 4`,
    `SU 6`,
    `Comp 4`,
    `SU 5`,
    `SU 7`,
    `Comp 5`,
    `Service Assemblies`,
    `SA 3`,
    `SA 4`,
    `SA 5`,
    `Shared Libraries`,
    `SL 1`,
  ];

  beforeEach(() => {
    cy.visit(`/login`);
  });

  it(`should have a petals tree`, () => {
    cy.login('admin', 'admin');

    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Petals`)
      .click();
    cy.get(PETALS_TREE_DOM.navTree.navTreePetals);

    const treeNames = cy.get(PETALS_TREE_DOM.texts.itemsNames);

    treeNames.each(($item, index) => cy.contains(expectedTreeNames[index]));
  });

  it(`should fold and unfold Petals Buses/Containers/Components/SUs`, () => {
    // we set a size to avoid clicking on invisible element in tree view
    cy.viewport(1920, 1200);

    cy.login('admin', 'admin');

    cy.expectTreeToBe(expectedTreeNames);

    cy.foldElementInTree(`bus`, `Bus 0`);

    cy.unfoldElementInTree(`bus`, `Bus 0`);

    cy.expectTreeToBe(expectedTreeNames);

    cy.foldElementInTree(`container`, `Cont 0`);

    cy.expectTreeToBe(treeWithCont0Folded);

    cy.unfoldElementInTree(`container`, `Cont 0`);

    cy.expectTreeToBe(expectedTreeNames);

    cy.foldElementInTree(`component`, `Comp 0`);

    cy.expectTreeToBe(treeWithComp0Folded);

    cy.unfoldElementInTree(`component`, `Comp 0`);

    cy.expectTreeToBe(expectedTreeNames);

    cy.foldElementInTree(`category-service-assemblies`, `Service Assemblies`);

    cy.expectTreeToBe(treeWithSasFolded);

    cy.unfoldElementInTree(`category-service-assemblies`, `Service Assemblies`);

    cy.expectTreeToBe(expectedTreeNames);
  });

  it(`should unfold found element when searching in Petals menu`, () => {
    cy.login('admin', 'admin');

    cy.foldElementInTree(`bus`, `Bus 0`);

    cy.get(PETALS_DOM.inputs.search).type(`su 0`);

    const treeFiltered = [`Bus 0`, `Cont 0`, `Components`, `Comp 0`, `SU 0`];

    cy.expectTreeToBe(treeFiltered);
  });

  it(`should clear input and focus search bar when the message saying no match is closed`, () => {
    cy.login('admin', 'admin');

    cy
      .get(PETALS_DOM.inputs.search)
      .type(`Some random search`)
      .expectFocused();

    cy
      .get(MESSAGE_DOM.texts.msgDetails)
      .contains(`There is no match with "Some random search".`);

    cy.get(MESSAGE_DOM.buttons.cancelMessage).click();

    cy.get(PETALS_DOM.inputs.search).should('be.empty');
  });

  it(`should contain the correct buses in progress`, () => {
    cy.login('admin', 'admin');

    cy.get(BIP_DOM.navList.navListBipPetals);

    const busesInProgress = cy.get(BIP_DOM.texts.ipPort);
    const expectedBusesInProgress = [`192.168.0.1:7700`, `192.168.0.2:7700`];

    busesInProgress.each(($item, index) =>
      cy.contains(expectedBusesInProgress[index])
    );
  });

  it(`should filter by bus, container, component, su and categories when searching in Petals menu`, () => {
    // we set a size to avoid clicking on invisible element in tree view
    cy.viewport(1920, 1200);

    cy.login('admin', 'admin');

    cy.get(PETALS_DOM.inputs.search).type(`CoMp 0`);

    cy.expectTreeToBe(availableBusesFilteredComp0);

    cy.expectHighlightedElementToBe([`Comp 0`]);

    cy
      .get(PETALS_DOM.inputs.search)
      .clear()
      .type(`u`);

    cy.expectTreeToBe(availableBusesFiltered);

    cy.expectHighlightedElementToBe(elementsHighlighted);

    cy
      .get(PETALS_DOM.inputs.search)
      .clear()
      .type(`Service Assemblies`);

    cy.expectTreeToBe(availableSasCategoriesFiltered);

    cy.expectHighlightedElementToBe([
      `Service Assemblies`,
      `Service Assemblies`,
    ]);
  });

  it(`should fold and unfold a category without changing the url`, () => {
    cy.login('admin', 'admin');

    cy.getElementInPetalsTree(`service-unit`, `SU 0`).click();

    cy.foldElementInTree(`container`, `Cont 0`);

    cy.expectLocationToBe(`/workspaces/idWks0/petals/service-units/idSu0`);

    cy.foldElementInTree(`category-service-assemblies`, `Service Assemblies`);

    cy.expectLocationToBe(`/workspaces/idWks0/petals/service-units/idSu0`);
  });

  const treeWithCont0Folded = [
    `Bus 0`,
    `Cont 0`,
    `Cont 1`,
    `Components`,
    `Comp 3`,
    `SU 4`,
    `SU 6`,
    `Comp 4`,
    `SU 5`,
    `SU 7`,
    `Comp 5`,
    `Service Assemblies`,
    `SA 3`,
    `SA 4`,
    `SA 5`,
    `Shared Libraries`,
    `SL 1`,
  ];

  const treeWithComp0Folded = [
    `Bus 0`,
    `Cont 0`,
    `Components`,
    `Comp 0`,
    `Comp 1`,
    `SU 1`,
    `SU 3`,
    `Comp 2`,
    `Service Assemblies`,
    `SA 0`,
    `SA 1`,
    `SA 2`,
    `Shared Libraries`,
    `SL 0`,
    `Cont 1`,
    `Components`,
    `Comp 3`,
    `SU 4`,
    `SU 6`,
    `Comp 4`,
    `SU 5`,
    `SU 7`,
    `Comp 5`,
    `Service Assemblies`,
    `SA 3`,
    `SA 4`,
    `SA 5`,
    `Shared Libraries`,
    `SL 1`,
  ];

  const treeWithSasFolded = [
    `Bus 0`,
    `Cont 0`,
    `Components`,
    `Comp 0`,
    `SU 0`,
    `SU 2`,
    `Comp 1`,
    `SU 1`,
    `SU 3`,
    `Comp 2`,
    `Service Assemblies`,
    `Shared Libraries`,
    `SL 0`,
    `Cont 1`,
    `Components`,
    `Comp 3`,
    `SU 4`,
    `SU 6`,
    `Comp 4`,
    `SU 5`,
    `SU 7`,
    `Comp 5`,
    `Service Assemblies`,
    `SA 3`,
    `SA 4`,
    `SA 5`,
    `Shared Libraries`,
    `SL 1`,
  ];

  const availableBusesFilteredComp0 = [
    `Bus 0`,
    `Cont 0`,
    `Components`,
    `Comp 0`,
    `SU 0`,
    `SU 2`,
  ];

  const availableBusesFiltered = [
    `Bus 0`,
    `Cont 0`,
    `Components`,
    `Comp 0`,
    `SU 0`,
    `SU 2`,
    `Comp 1`,
    `SU 1`,
    `SU 3`,
    `Comp 2`,
    `Service Assemblies`,
    `SA 0`,
    `SA 1`,
    `SA 2`,
    `Shared Libraries`,
    `SL 0`,
    `Cont 1`,
    `Components`,
    `Comp 3`,
    `SU 4`,
    `SU 6`,
    `Comp 4`,
    `SU 5`,
    `SU 7`,
    `Comp 5`,
    `Service Assemblies`,
    `SA 3`,
    `SA 4`,
    `SA 5`,
    `Shared Libraries`,
    `SL 1`,
  ];

  const elementsHighlighted = [
    `Bus 0`,
    `SU 0`,
    `SU 2`,
    `SU 1`,
    `SU 3`,
    `SU 4`,
    `SU 6`,
    `SU 5`,
    `SU 7`,
  ];

  const availableSasCategoriesFiltered = [
    `Bus 0`,
    `Cont 0`,
    `Service Assemblies`,
    `SA 0`,
    `SA 1`,
    `SA 2`,
    `Cont 1`,
    `Service Assemblies`,
    `SA 3`,
    `SA 4`,
    `SA 5`,
  ];
});
