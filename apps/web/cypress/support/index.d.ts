// Extend Cypress global types (eslint-disable-next-line is required for namespace usage)
/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      /**
       * Custom command to login with Auth0
       * @param username - Auth0 username (optional, uses env var if not provided)
       * @param password - Auth0 password (optional, uses env var if not provided)
       */
      auth0Login(username?: string, password?: string): Chainable<void>;

      /**
       * Custom command to logout from Auth0
       */
      auth0Logout(): Chainable<void>;

      /**
       * Custom command to login via Auth0 UI (fallback method)
       * @param email - User email
       * @param password - User password
       */
      auth0UILogin(email: string, password: string): Chainable<void>;

      /**
       * Custom command to set mobile viewport
       */
      mobileViewport(): Chainable<void>;

      /**
       * Custom command to check if element is active
       */
      isActive(): Chainable<Subject>;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

export {};