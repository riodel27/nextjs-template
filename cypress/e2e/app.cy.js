describe('Homepage', () => {
  it('Displays the NEXT.JS Template text', () => {
    cy.visit('http://localhost:3000/');

    cy.contains('NEXT.JS Template');
  });
});
