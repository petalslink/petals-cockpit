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
