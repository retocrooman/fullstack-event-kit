// Custom commands are loaded via support/e2e.ts

const EMAIL: string = Cypress.env('USER_EMAIL');
const PASSWORD: string = Cypress.env('USER_PASSWORD');
const SKIP_AUTH_TESTS: boolean = Cypress.env('SKIP_AUTH_TESTS');

// Skip auth tests if credentials are not provided or SKIP_AUTH_TESTS is true
if (SKIP_AUTH_TESTS || !EMAIL || !PASSWORD) {
  console.log('Skipping auth tests: credentials not provided or SKIP_AUTH_TESTS=true');
}

const AUTH0_DOMAIN = 'https://dev-6j00ek4wifluuiat.us.auth0.com';

const login = (): void => {
  // Click login button and wait for Auth0 redirect
  cy.get('[data-testid=login-button]').click();
  
  // Handle Auth0 login in cross-origin context
  cy.origin(AUTH0_DOMAIN, 
    { args: { EMAIL, PASSWORD } }, 
    ({ EMAIL, PASSWORD }: { EMAIL: string; PASSWORD: string }) => {
      // Wait for Auth0 login page to load
      cy.url({ timeout: 15000 }).should('include', 'auth0.com');
      
      // Debug: Take screenshot and log page content
      cy.screenshot('auth0-login-page');
      cy.get('body').then(($body) => {
        cy.log('Page HTML:', $body.html());
      });
      
      // Try multiple possible selectors for email field
      cy.get('body').then(($body) => {
        if ($body.find('input[name=email]').length > 0) {
          cy.get('input[name=email]').focus().clear().type(EMAIL);
        } else if ($body.find('input[name=username]').length > 0) {
          cy.get('input[name=username]').focus().clear().type(EMAIL);
        } else if ($body.find('input[type=email]').length > 0) {
          cy.get('input[type=email]').focus().clear().type(EMAIL);
        } else if ($body.find('input[id*="email"], input[id*="Email"]').length > 0) {
          cy.get('input[id*="email"], input[id*="Email"]').first().focus().clear().type(EMAIL);
        } else {
          cy.get('input').first().focus().clear().type(EMAIL);
        }
      });
      
      // Try multiple possible selectors for password field
      cy.get('input[name=password], input[type=password]').focus().clear().type(PASSWORD, { log: false });
      
      // Try multiple possible selectors for submit button
      cy.get('button[type=submit], button[name=action], button[name=submit], form button').first().click();
    }
  );
  
  // Wait for redirect back to localhost and verify login success
  cy.url({ timeout: 20000 }).should('include', 'localhost:3000');
  cy.url().should('not.include', 'auth0.com');
};

describe('Auth0 Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  context('Not logged in', () => {
    it('should display login page', () => {
      cy.visit('/login');
      cy.get('[data-testid=login-button]').should('be.visible');
      cy.get('[data-testid=login-button]').should('contain.text', 'Sign In with Auth0');
    });

    it('should redirect to Auth0 login when clicking login button', () => {
      cy.visit('/login');
      cy.get('[data-testid=login-button]').click();
      // Auth0 Next.js SDK first goes to /api/auth/login then redirects to Auth0
      cy.url({ timeout: 10000 }).should('satisfy', (url: string) => {
        return url.includes('auth0.com') || url.includes('/api/auth/login');
      });
    });
  });

  // Auth integration tests with multiple approaches
  (SKIP_AUTH_TESTS || !EMAIL || !PASSWORD ? context.skip : context)('Auth Integration Tests', () => {

    it('should complete Auth0 login flow with UI interaction', () => {
      cy.visit('/login');
      
      // Use the new auth command
      cy.auth0UILogin(EMAIL, PASSWORD);
      
      // Verify successful login
      cy.url().should('not.include', 'auth0.com');
      cy.visit('/login');
      cy.get('[data-testid=logout-button]', { timeout: 10000 }).should('be.visible');
    });

    it('should handle logout flow', () => {
      // Login first
      cy.visit('/login');
      cy.auth0UILogin(EMAIL, PASSWORD);
      
      // Logout
      cy.get('[data-testid=logout-button]').click();
      
      // Verify logout
      cy.url().should('eq', `${Cypress.config().baseUrl}/`);
      cy.visit('/login');
      cy.get('[data-testid=login-button]').should('be.visible');
    });
  });

  // Debug test to examine Auth0 login page structure
  (SKIP_AUTH_TESTS || !EMAIL || !PASSWORD ? context.skip : context)('Auth0 Debug Tests', () => {

    it('should examine Auth0 login page structure', () => {
      cy.visit('/login');
      cy.get('[data-testid=login-button]').click();
      
      cy.origin('https://dev-6j00ek4wifluuiat.us.auth0.com', () => {
        cy.url({ timeout: 15000 }).should('include', 'auth0.com');
        
        // Wait for page to fully load
        cy.wait(3000);
        
        // Take screenshot for debugging
        cy.screenshot('auth0-debug-page');
        
        // Log page title and basic info
        cy.title().then((title) => {
          cy.log(`Page title: ${title}`);
        });
        
        // Check if page has loaded properly
        cy.get('body').then(($body) => {
          const bodyText = $body.text();
          cy.log(`Body text preview: ${bodyText.substring(0, 200)}...`);
          
          if (bodyText.includes('error') || bodyText.includes('Error')) {
            cy.log('ERROR: Auth0 page shows error content');
          }
          
          if (bodyText.includes('loading') || bodyText.includes('Loading')) {
            cy.log('INFO: Auth0 page is still loading');
          }
        });
        
        // Try to find any form elements
        cy.get('body').then(($body) => {
          const inputCount = $body.find('input').length;
          const buttonCount = $body.find('button').length;
          const formCount = $body.find('form').length;
          
          cy.log(`Elements found - Inputs: ${inputCount}, Buttons: ${buttonCount}, Forms: ${formCount}`);
          
          // If no form elements, log HTML structure
          if (inputCount === 0 && buttonCount === 0) {
            cy.log('No form elements found. HTML structure:');
            cy.log($body.html().substring(0, 1000));
          }
        });
        
        // Try to wait for dynamic content
        cy.get('body', { timeout: 10000 }).should('not.be.empty');
      });
    });

    it('should check Auth0 endpoint response directly', () => {
      // Test the Auth0 URL directly
      cy.request({
        url: 'https://dev-6j00ek4wifluuiat.us.auth0.com/.well-known/openid_configuration',
        failOnStatusCode: false
      }).then((response) => {
        cy.log(`Auth0 config endpoint status: ${response.status}`);
        if (response.status === 200) {
          cy.log('Auth0 tenant is accessible');
        } else {
          cy.log('Auth0 tenant configuration issue');
        }
      });
    });
  });
});