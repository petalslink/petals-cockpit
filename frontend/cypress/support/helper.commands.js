import b64toBlob from './utils.js';

Cypress.Commands.add(
  'expectFocused',
  {
    prevSubject: true,
  },
  ([subject]) => {
    cy.focused().then(([focusedElem]) => {
      expect(focusedElem).to.eq(subject);
    });
  }
);

Cypress.Commands.add('expectLocationToBe', pathname => {
  return cy
    .location()
    .should(location => expect(location.pathname).to.eq(pathname));
});

Cypress.Commands.add('uploadFile', (fixtureName, fileInputDom) => {
  // Since we can't directly upload a file with Cypress, we use a workaround:
  // https://github.com/cypress-io/cypress/issues/170#issuecomment-370808733
  cy.fixture(fixtureName).then(file => {
    cy.get(fileInputDom).then($fileInput => {
      let blob = b64toBlob(file);
      const fileData = new DataTransfer();
      fileData.items.add(new File([blob], fixtureName));
      $fileInput.get(0).files = fileData.files;
    });
  });
});
