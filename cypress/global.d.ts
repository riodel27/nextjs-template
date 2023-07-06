declare namespace Cypress {
  interface CustomWindow extends Window {}

  interface Chainable {
    login(email: string, password: string): void;
    register(user: { name: string; email: string; password: string }): void;
  }
}
