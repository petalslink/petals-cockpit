describe('Shared Library', () => {
  beforeEach(() => {
    cy.visit(`/login`);

    cy.login('admin', 'admin');
  });

  it('should show name and version in overview', () => {
    cy
      .get('.mat-list-item-content')
      .contains('SL 0')
      .click();

    cy.get('.workspace-element .title').should('contain', 'SL 0');

    cy.get('.workspace-element .sl-version').should('contain', '1.0.0');
  });
});
