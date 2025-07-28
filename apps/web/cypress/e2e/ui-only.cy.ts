// Custom commands are loaded via support/e2e.ts

describe('UI-Only Tests (No Auth Required)', () => {
  // Skip if no baseUrl is configured
  const hasBaseUrl = Cypress.config('baseUrl');

  describe('Homepage', () => {
    it('should load the homepage', function() {
      if (!hasBaseUrl) {
        this.skip();
      }
      cy.visit('/');
      cy.url().should('include', 'localhost:3000');
      cy.get('body').should('be.visible');
    });

    it('should have basic page structure', function() {
      if (!hasBaseUrl) {
        this.skip();
      }
      cy.visit('/');
      // Check if page has essential elements
      cy.get('html').should('have.attr', 'lang', 'ja');
      cy.title().should('not.be.empty');
    });
  });

  describe('Login Page (UI Only)', () => {
    it('should display login page elements', function() {
      if (!hasBaseUrl) {
        this.skip();
      }
      cy.visit('/login');
      cy.get('[data-testid=login-button]').should('be.visible');
      cy.get('[data-testid=login-button]').should('contain.text', 'Sign In with Auth0');
    });

    it('should have proper login button styling', function() {
      if (!hasBaseUrl) {
        this.skip();
      }
      cy.visit('/login');
      cy.get('[data-testid=login-button]')
        .should('have.class', 'bg-gradient-to-r')
        .should('be.visible');
    });
  });

  describe('Navigation', () => {
    it('should navigate between public pages', function() {
      if (!hasBaseUrl) {
        this.skip();
      }
      // Homepage
      cy.visit('/');
      cy.url().should('eq', `${Cypress.config().baseUrl}/`);
      
      // Login page
      cy.visit('/login');
      cy.url().should('include', '/login');
      cy.get('[data-testid=login-button]').should('be.visible');
    });
  });

  describe('Responsive Design', () => {
    it('should work on mobile viewport', function() {
      if (!hasBaseUrl) {
        this.skip();
      }
      cy.mobileViewport();
      cy.visit('/login');
      cy.get('[data-testid=login-button]').should('be.visible');
    });

    it('should work on desktop viewport', function() {
      if (!hasBaseUrl) {
        this.skip();
      }
      cy.viewport(1280, 720);
      cy.visit('/login');
      cy.get('[data-testid=login-button]').should('be.visible');
    });
  });

  describe('TypeScript Integration', () => {
    it('should validate TypeScript functionality', () => {
      const testData: { message: string; count: number } = {
        message: 'Hello TypeScript',
        count: 42
      };
      
      expect(testData.message).to.equal('Hello TypeScript');
      expect(testData.count).to.be.a('number');
      expect(testData.count).to.equal(42);
    });

    it('should handle async operations', () => {
      const promise: Promise<string> = new Promise((resolve) => {
        setTimeout(() => resolve('TypeScript Promise'), 100);
      });

      cy.wrap(promise).should('equal', 'TypeScript Promise');
    });
  });
});