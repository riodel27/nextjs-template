import { Cypress, cy } from 'local-cypress';

Cypress.Commands.add('login', (email, password) => {
  cy.get('[data-cy="email"]').type(email);
  cy.get('[data-cy="password"]').type(password);
  cy.get('[data-cy="form"]').submit();
});

Cypress.Commands.add('register', ({ name, email, password }) => {
  cy.get('[data-cy="name"]').type(name);
  cy.get('[data-cy="email"]').type(email);
  cy.get('[data-cy="password"]').type(password);
  cy.get('[data-cy="confirm-password"]').type(password);
  cy.get('[data-cy="form"]').submit();
});
