import {
  COMPONENT_DOM,
  COMPONENT_OVERVIEW_DOM,
  COMPONENT_OPERATIONS_DOM,
  COMPONENT_OV_SL_DOM,
  COMPONENT_UPLOAD_DOM,
} from './component.dom';

Cypress.Commands.add('getActionStateInLifecycleComponent', name => {
  return cy.get(COMPONENT_OPERATIONS_DOM.buttons.actionState).contains(name);
});

Cypress.Commands.add(
  'checkOverrideSharedLibrariesInputs',
  expectedSharedLibraries => {
    cy
      .get(COMPONENT_OV_SL_DOM.slInputs)
      .should('have.length', expectedSharedLibraries.length)
      .each(($el, index) => {
        expect($el.val()).equals(expectedSharedLibraries[index]);
      });
  }
);

Cypress.Commands.add(
  'checkUploadComponentSharedLibraries',
  expectedSharedLibraries => {
    const slList = cy.get(COMPONENT_UPLOAD_DOM.slList);
    slList.should('have.length', expectedSharedLibraries.length / 2);
    expectedSharedLibraries.forEach(sl => {
      slList.should('contain', sl);
    });
  }
);
