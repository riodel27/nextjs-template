import { beforeEach, cy, describe, it } from 'local-cypress';

import { signIn, signOut } from 'next-auth/react';

const user = {
  name: 'randomuser',
  email: 'randomuser@gmail.com',
  password: 'P@ssword01',
};

describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display the input email address', () => {
    cy.get('[data-cy="email"]').should('be.visible');
  });

  it('should display the input password', () => {
    cy.get('[data-cy="password"]').should('be.visible');
  });

  it('should show the readable password when show password button is clicked', () => {
    cy.get('[data-cy="password"]').type(user.password);

    cy.get('[data-cy="show-password-icon"]').click();

    cy.get('[data-cy="password"]')
      .invoke('prop', 'type')
      .should('equal', 'text');
  });

  it('should display the submit button', () => {
    cy.get('[data-cy="sign-in-link"]').should('be.visible');
  });

  it('should allow user to redirect to register page', () => {
    // It is important to sign out first to ensure that the user is not redirected to the homepage
    signOut({ redirect: false });

    cy.get('[data-cy="sign-up-link"]').should('be.visible');
  });

  it('should disable the submit button and display loading indicator while loading', () => {
    cy.login(user.email, user.password);

    cy.get('[data-cy="sign-in-loading"]').should('be.visible');
    cy.get('[data-cy="sign-in-link"]').should('be.disabled');

    cy.get('[data-cy="sign-in-link"]').should(
      'not.contain',
      '[data-cy="sign-in-loading"]',
      'Expected loading element to not exist'
    );
    cy.get('[data-cy="sign-in-link"]').should('be.enabled');
  });

  describe('Authentication', () => {
    beforeEach(() => {
      cy.task('upsertTestUser', {
        name: user.name,
        email: user.email,
        password: user.password,
        failedLoginAttempts: 0,
      });
    });

    it('should display an error for invalid login credentials', () => {
      cy.login(user.email, 'wrongpassword');

      cy.contains('Invalid login credentials');
    });

    it('should display an error for your account has been locked due to multiple failed login attempts. For security purposes, access to your account has been temporarily suspended. Please follow the steps below to regain access', () => {
      cy.get('[data-cy="email"]').type(user.email);
      cy.get('[data-cy="password"]').type('wrongpassword');

      for (let i = 0; i < 3; i++) {
        cy.get('[data-cy="form"]').submit();
        cy.contains('Invalid login credentials');
      }

      cy.get('[data-cy="form"]').submit();

      cy.contains(
        'Your account has been locked due to multiple failed login attempts. For security purposes, access to your account has been temporarily suspended. Please follow the steps below to regain access'
      );
    });

    it('should login the user and redirect to homepage after successful login', () => {
      cy.login(user.email, user.password);

      cy.location('pathname').should('equal', '/');
      cy.url().should('include', 'signin=success');
      cy.contains('SignIn Successful!');
    });

    it('should redirect to homepage when authenticated', async () => {
      // To simulate an authenticated user, we need to first sign in using NextAuth.
      await signIn('credentials', {
        email: user.email,
        password: user.password,
        redirect: false,
      });

      cy.visit('/login');

      cy.location('pathname').should('equal', '/');
    });
  });
});
