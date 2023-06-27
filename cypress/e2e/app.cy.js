describe('Homepage', () => {
  it('Displays the Get tarted text', () => {
    cy.visit('http://localhost:3000/');

    cy.contains('Get started');
  });
});
