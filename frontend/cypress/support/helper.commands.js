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
