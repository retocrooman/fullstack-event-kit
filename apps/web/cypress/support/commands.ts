// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Type definitions are automatically loaded via tsconfig.json

// Auth0 login command
Cypress.Commands.add('auth0Login', (username?: string, password?: string) => {
  const EMAIL = username || Cypress.env('USER_EMAIL');
  const PASSWORD = password || Cypress.env('USER_PASSWORD');

  if (!EMAIL || !PASSWORD) {
    throw new Error('You must provide CYPRESS_USER_EMAIL and CYPRESS_USER_PASSWORD environment variables');
  }

  // Click login button to go to Auth0
  cy.get('[data-testid=login-button]').click();
  
  // Fill Auth0 login form
  const AUTH0_DOMAIN = 'https://dev-6j00ek4wifluuiat.us.auth0.com';
  cy.origin(AUTH0_DOMAIN, { args: { EMAIL, PASSWORD } }, ({ EMAIL, PASSWORD }) => {
    cy.get('input[name=email], input[name=username]').focus().clear().type(EMAIL);
    cy.get('input[name=password]').focus().clear().type(PASSWORD, { log: false });
    cy.get('button[type=submit][name=action]:visible, button[type=submit][name=submit]').click();
  });

  // Wait for redirect back to app
  cy.url().should('eq', 'http://localhost:3000/');
});

// Logout command
Cypress.Commands.add('auth0Logout', () => {
  cy.get('[data-testid=logout-button]').click();
  cy.url().should('eq', 'http://localhost:3000/');
});

// Mobile viewport command
Cypress.Commands.add('mobileViewport', () => {
  cy.viewport(375, 667);
});

// Custom command to check if link is active
Cypress.Commands.add('isActive', { prevSubject: true }, (subject) => {
  return cy.wrap(subject).should('satisfy', (el) => {
    return el.hasClass('active') || el.attr('aria-current') === 'page';
  });
});