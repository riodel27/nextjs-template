import { beforeEach, cy, describe, expect, it } from 'local-cypress';

import { signIn, signOut } from 'next-auth/react';

const user = {
  name: 'randomuser',
  email: 'randomuser@gmail.com',
  password: 'P@ssword01',
};

describe('Register Page', () => {
  describe('Form Validation', () => {
    beforeEach(() => {
      cy.visit('/register');
    });

    it('should handle network request failures', () => {
      cy.intercept('POST', 'api/auth/register', {
        times: 1,
        forceNetworkError: true,
      }).as('forceNetworkErrorRequest');

      cy.register(user);

      cy.wait('@forceNetworkErrorRequest');

      cy.contains('Oops! Something went wrong. Please try again later.');
    });

    it('should display error message for unknown issues or errors', () => {
      cy.intercept('POST', 'api/auth/register', {
        statusCode: 500,
        body: ' Internal Server Error',
      }).as('internalServerErrorResponse');

      cy.register(user);

      cy.wait('@internalServerErrorResponse');

      cy.contains('Oops! Something went wrong. Please try again later.');
    });

    it('should have correct alert color', () => {
      cy.get('[data-cy="name"]').type('p');

      cy.get('[data-cy="form"]').submit();

      cy.get('[role="alert"]').should('have.class', 'text-destructive');
    });

    it('should display an error message when name entered is too short', () => {
      cy.get('[data-cy="name"]').type('p');

      cy.get('[data-cy="form"]').submit();

      cy.contains('Name must be a minimum of 5 characters.');
    });

    it('should display an error message when an invalid email address is entered', () => {
      cy.get('[data-cy="email"]').type('email');

      cy.get('[data-cy="form"]').submit();

      cy.contains('Please enter a valid email address.');
    });

    it('should display an error message when password entered is not valid', () => {
      cy.get('[data-cy="password"]').type('pass');

      cy.get('[data-cy="form"]').submit();

      cy.contains('Password must be at least 6 characters long');
      cy.contains('Password must contain at least one number');
      cy.contains('Password must contain at least one special character');
      cy.contains('Password must contain at least one uppercase letter');
    });

    it('should display an error message when confirm password do not match the entered password', () => {
      cy.get('[data-cy="password"]').type('password');

      cy.get('[data-cy="confirm-password"]').type('notmatchingpassword');

      cy.get('[data-cy="form"]').submit();

      cy.contains('The passwords do not match.');
    });

    it('should show the readable password when show password button is clicked', () => {
      cy.get('[data-cy="password"]').type(user.password);

      cy.get('[data-cy="show-password-icon"]').click();

      cy.get('[data-cy="password"]')
        .invoke('prop', 'type')
        .should('equal', 'text');
    });

    it('should disable the submit button and display loading indicator while loading', () => {
      // The success or failure of the response is not relevant. The primary objective is to verify the functionality of the loading state.
      cy.intercept('POST', 'api/auth/register', (req) => {
        req.continue((res) => {
          // apply a delay of 1 second and a throttle of 56kbps
          res.setDelay(1000).setThrottle(56);
        });
      }).as('signupRequest');

      cy.register(user);

      cy.get('[data-cy="sign-up-loading"]').should('be.visible');
      cy.get('[data-cy="sign-up-link"]').should('be.disabled');

      cy.wait('@signupRequest').then(() => {
        cy.get('[data-cy="sign-up-link"]').should(
          'not.contain',
          '[data-cy="sign-up-loading"]',
          'Expected loading element to not exist'
        );
        cy.get('[data-cy="sign-up-link"]').should('be.enabled');
      });
    });
  });

  describe('Registration', () => {
    beforeEach(() => {
      cy.intercept('POST', 'api/auth/register').as('registerUserApi');

      cy.task('upsertTestUser', {
        name: user.name,
        email: user.email,
        password: user.password,
      });

      cy.visit('/register');
    });

    it('should display an error for email already existing', () => {
      cy.register(user);

      cy.wait('@registerUserApi').then((interception) => {
        expect(interception.response?.statusCode).to.equal(409);

        cy.contains('The provided email address is already registered.');
      });
    });

    it('should register a new user', () => {
      // Before registering a new user, we should ensure that any existing test user with the same email is deleted from the database."
      cy.task('deleteTestUser', { email: user.email });

      cy.register(user);

      cy.wait('@registerUserApi').then((interception) => {
        expect(interception.response?.statusCode === 201);

        if (interception?.response) {
          cy.task('getTestUser', {
            email: JSON.parse(interception.response.body)?.user?.email,
          }).then((newUser) => {
            const typedNewUser = newUser as { email: string };
            expect(typedNewUser).to.exist;
            expect(typedNewUser.email).to.equal(user.email);

            cy.location('pathname').should('equal', '/');

            cy.url().should('include', 'signup=success');

            cy.contains('Signup Successful!');
          });
        }
      });
    });

    it('should login after successful signup', () => {
      // Before registering a new user, we should ensure that any existing test user with the same email is deleted from the database."
      cy.task('deleteTestUser', { email: user.email });

      cy.register(user);

      cy.wait('@registerUserApi').then((interception) => {
        expect(interception.response?.statusCode === 201);

        cy.location('pathname').should('equal', '/');

        cy.url().should('include', 'signup=success');

        cy.contains('Signup Successful!');
      });
    });

    it('should redirect authenticated user to homepage', async () => {
      // To simulate an authenticated user, we will first sign in using NextAuth.
      await signIn('credentials', {
        email: 'anotherrandomuser@gmail.com',
        password: 'P@ssword01',
        redirect: false,
      });

      cy.visit('/register');

      cy.location('pathname').should('equal', '/');
    });
  });

  it('should allow user to redirect to login page', () => {
    // Signing out beforehand is essential to prevent any redirection to the homepage.
    signOut({ redirect: false });

    cy.visit('/register');
    cy.get('[data-cy="sign-in-link"]').should('be.visible');
  });
});
