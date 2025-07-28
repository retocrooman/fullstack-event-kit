// Auth0 programmatic login commands based on official samples
// https://github.com/auth0-samples/auth0-nextjs-samples

Cypress.Commands.add('auth0Login', (username?: string, password?: string) => {
  const EMAIL = username || Cypress.env('USER_EMAIL');
  const PASSWORD = password || Cypress.env('USER_PASSWORD');

  if (!EMAIL || !PASSWORD) {
    throw new Error('Missing Auth0 credentials for login');
  }

  // Use UI-based login (more reliable for E2E testing)
  cy.auth0UILogin(EMAIL, PASSWORD);
});

Cypress.Commands.add('auth0Logout', () => {
  // Clear tokens
  cy.window().then((win) => {
    win.localStorage.clear();
    win.sessionStorage.clear();
  });
  
  // Visit logout endpoint
  cy.visit('/api/auth/logout');
});

// Helper command for UI-based login (fallback)
Cypress.Commands.add('auth0UILogin', (email: string, password: string) => {
  const AUTH0_DOMAIN = 'https://dev-6j00ek4wifluuiat.us.auth0.com';
  
  cy.visit('/login');
  cy.get('[data-testid=login-button]').click();
  
  cy.origin(AUTH0_DOMAIN, 
    { args: { email, password } }, 
    ({ email, password }: { email: string; password: string }) => {
      cy.url({ timeout: 15000 }).should('include', 'auth0.com');
      
      // Wait for the page to fully load and debug what's available
      cy.wait(3000);
      
      // Debug: Log all available input fields
      cy.get('input').then(($inputs) => {
        cy.log(`Found ${$inputs.length} input fields`);
        $inputs.each((index, input) => {
          const $input = Cypress.$(input);
          cy.log(`Input ${index}: name="${$input.attr('name')}" type="${$input.attr('type')}" id="${$input.attr('id')}" class="${$input.attr('class')}"`);
        });
      });
      
      // Try multiple strategies to find email field
      cy.get('body').then(($body) => {
        // Strategy 1: Standard selectors
        if ($body.find('input[type="email"]').length > 0) {
          cy.get('input[type="email"]').first().focus().clear().type(email);
        } else if ($body.find('input[name="email"]').length > 0) {
          cy.get('input[name="email"]').first().focus().clear().type(email);
        } else if ($body.find('input[name="username"]').length > 0) {
          cy.get('input[name="username"]').first().focus().clear().type(email);
        // Strategy 2: Look for common Auth0 patterns
        } else if ($body.find('input[placeholder*="email" i]').length > 0) {
          cy.get('input[placeholder*="email" i]').first().focus().clear().type(email);
        } else if ($body.find('input[placeholder*="Email" i]').length > 0) {
          cy.get('input[placeholder*="Email" i]').first().focus().clear().type(email);
        // Strategy 3: First visible input field
        } else if ($body.find('input:visible').length > 0) {
          cy.get('input:visible').first().focus().clear().type(email);
        } else {
          throw new Error('No email input field found on Auth0 login page');
        }
      });
      
      // Find password field
      cy.get('input[type="password"], input[name="password"]')
        .should('be.visible')
        .focus()
        .clear()
        .type(password, { log: false });
      
      cy.get('button[type="submit"], button[value="default"], [data-action-button-primary]')
        .should('be.visible')
        .first()
        .click();
      
      // Handle potential consent screen
      cy.url({ timeout: 10000 }).then((url) => {
        if (url.includes('/u/consent')) {
          cy.log('Auth0 consent screen detected, clicking Accept');
          // Look for Accept/Allow/Continue button on consent screen
          cy.get('button[value="accept"], button[type="submit"], button:contains("Accept"), button:contains("Allow"), button:contains("Continue")')
            .should('be.visible')
            .first()
            .click();
        }
      });
    }
  );
  
  // Wait for redirect back to app (after consent if needed)
  cy.url({ timeout: 20000 }).should('include', 'localhost:3000');
});

// Type definitions are handled in index.d.ts using module declaration