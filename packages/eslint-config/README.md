# @repo/eslint-config

Shared ESLint configuration for the monorepo.

## Usage

### For Next.js applications

```javascript
// eslint.config.mjs
import nextConfig from '@repo/eslint-config/next.js';

export default nextConfig;
```

### For NestJS applications

```javascript
// eslint.config.mjs
import nestConfig from '@repo/eslint-config/nest.js';

export default nestConfig;
```

Note: NestJS configuration uses the same base rules as Next.js for consistency.

### For other TypeScript projects

```javascript
// eslint.config.mjs
import baseConfig from '@repo/eslint-config';

export default baseConfig;
```

## Configurations

- **Base config** (`index.js`): TypeScript-focused rules with common best practices
- **Next.js config** (`next.js`): Extends base config with Next.js specific rules, import ordering, and unused imports detection
- **NestJS config** (`nest.js`): Extends base config with Node.js and Jest globals, plus NestJS-specific TypeScript rules

## Features

### Next.js Configuration

- Next.js core web vitals
- TypeScript support
- Import ordering and organization
- Unused imports detection
- Prettier integration
- Custom rules for React/Next.js development

### NestJS Configuration

- Node.js and Jest globals
- TypeScript strict checking
- Prettier integration
- NestJS-specific rule adjustments
- Project service for better type checking

## Dependencies

All necessary ESLint plugins and configurations are included as dependencies, so you only need to install this package and ESLint itself in your applications.
