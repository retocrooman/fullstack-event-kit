# @repo/typescript-config

Shared TypeScript configuration for the monorepo.

## Usage

### For Next.js applications

```json
{
  "extends": "@repo/typescript-config/next.json"
}
```

### For NestJS applications

Development configuration:

```json
{
  "extends": "@repo/typescript-config/nest.json"
}
```

Build configuration:

```json
{
  "extends": "@repo/typescript-config/nest-build.json"
}
```

### For other TypeScript projects

```json
{
  "extends": "@repo/typescript-config/base.json"
}
```

## Configurations

- **Base config** (`base.json`): Common TypeScript settings for all projects
- **Next.js config** (`next.json`): Next.js specific settings with DOM types and JSX support
- **NestJS config** (`nest.json`): Node.js backend settings with decorators and CommonJS
- **NestJS Build config** (`nest-build.json`): Production build settings excluding test files

## Features

### Base Configuration

- ES2017 target for modern JavaScript support
- Strict type checking enabled
- Module resolution and interop settings
- Incremental compilation for faster builds

### Next.js Configuration

- DOM and ESNext library support
- JSX preserve mode for Next.js
- Bundler module resolution
- Path mapping support (@/\* aliases)
- Next.js plugin integration

### NestJS Configuration

- ES2023 target for latest features
- CommonJS module system
- Decorator support for NestJS
- Source maps for debugging
- Declaration file generation
- Flexible type checking for rapid development
