# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## General Workflow

When working on any task in this codebase, follow this workflow:

1. **Think and Plan**: First think through the problem, read the codebase for relevant files, and create a plan using the TodoWrite tool.

2. **Create Todo List**: Use the TodoWrite tool to create a list of todo items that you can check off as you complete them.

3. **Get Approval**: Before you begin working, check in with me and I will verify the plan.

4. **Execute and Track**: Then, begin working on the todo items, marking them as complete as you go using the TodoWrite tool.

5. **Communicate Progress**: Please every step of the way just give me a high level explanation of what changes you made.

6. **Keep It Simple**: Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.

7. **Review and Document**: Finally, provide a summary of the changes you made and any other relevant information.

## Code Comments Guidelines

Write concise, meaningful code comments that focus on:

### What TO Include

- **Why decisions were made** - Business logic reasoning, architecture choices
- **Complex algorithm explanations** - How non-obvious code works
- **API contracts** - Parameters, return values, side effects
- **Gotchas and edge cases** - Known issues, browser compatibility, performance implications
- **Integration context** - How this code connects to other systems

### What NOT to Include

- Filler words: "simple", "basic", "easy", "trivial", "refined", "new", "just"
- Obvious code descriptions: `// Set loading to true` for `setLoading(true)`
- TODO markers without context or owner
- Outdated information that doesn't match current implementation
- Generic placeholders that add no value

### Examples

**Good:**

```typescript
/**
 * Resolves MFE version based on strategy and rollback configuration
 * Strategy 'rollback' prioritizes rollback version over latest for incident recovery
 * @param mfeName - MFE identifier matching versions.json keys
 * @param strategy - 'latest' uses current version, 'rollback' uses previous stable
 */

// Module Federation requires singleton React to prevent context conflicts
shared: {
  react: {
    singleton: true;
  }
}

// Cache key includes user ID because permissions vary per user
const cacheKey = `project-${projectId}-${userId}`;
```

**Bad:**

```typescript
// Simple function to load MFE
// Basic version resolution logic
// New implementation of loading

// Set the state
setState(newValue);

// Initialize the component
useEffect(() => {
  /* ... */
}, []);
```

## Project Overview

This is an Nx monorepo implementing a microfrontend architecture with Module Federation for Riverside.fm. The project aims to migrate monolithic frontend applications to a micro-frontend architecture, enabling independent development, deployment, and scaling of individual business domains while maintaining a cohesive user experience.

### Key Technical Goals

- **70% faster builds** - From 20 minutes to 3-6 minutes per domain
- **5x deployment frequency** - Teams deploy independently without coordination
- **40% developer productivity gain** - Reduced cross-team dependencies and faster feedback loops
- **Zero-downtime deployments** - Feature flag-driven version management
- **Independent deployment** - Each microfrontend deploys separately via module federation

### Current State

- Two React applications sharing 90%+ dependencies:
  - `riverside-fe` - Main application
  - `studio-app` - Studio-specific features
- 15-20 minute build times blocking developer productivity
- Monolithic test suite causing cascading failures
- 6,000+ files affected by circular dependencies
- Dual implementation of studio features across both apps

## Essential Commands

### Development

- `pnpm serve:all` - Start all microfrontend apps (shell on 4000, editor on 4001, studio on 4002)
- `pnpm serve:shell` - Start only the shell (host) application
- `pnpm serve:studio` - Start only the studio microfrontend
- `pnpm serve:editor` - Start only the editor microfrontend

### Building

- `pnpm build:all` - Build all applications and libraries
- `pnpm nx build <project>` - Build a specific project (e.g., `pnpm nx build shell`)
- `pnpm affected:build` - Build only affected projects based on git changes

### Testing

- `pnpm test:all` - Run all tests
- `pnpm nx test <project>` - Test a specific project
- `pnpm affected:test` - Test only affected projects
- `pnpm nx test <project> --watch` - Run tests in watch mode for a specific project

### Code Quality

- `pnpm lint:all` - Lint all projects
- `pnpm nx lint <project>` - Lint a specific project
- `pnpm nx format` - Format code with Prettier

### Utilities

- `pnpm graph` - Visualize project dependencies
- `pnpm nx g @nx/react:component <name> --project=<project>` - Generate a new component

## Architecture

### Microfrontend Structure

The project uses Module Federation to create a distributed frontend architecture with several microfrontends:

1. **Shell App** (port 4000) - The host application that loads remote modules

   - Configured in `apps/shell/rsbuild.config.ts`
   - Imports all microfrontends as remote modules
   - Acts as the main entry point and orchestrator
   - Manages authentication, navigation, and cross-MFE communication

2. **Studio App** (port 4002) - Remote microfrontend for studio functionality

   - Live recording sessions
   - Participants management
   - Real-time communication (WebSocket management)
   - Virtual backgrounds and effects

3. **Editor App** (port 4001) - Remote microfrontend for editor functionality

   - Timeline editing and media manipulation
   - Effects and transitions
   - AI-powered features (magic tools, suggestions)
   - Transcription management and export workflows

4. **Projects App** (port 4003) - Remote microfrontend for project management

   - Project management, search, and analytics
   - Asset management
   - Dashboard functionality
   - Co-creator functionality

5. **Account App** (port 4004) - Remote microfrontend for user account

   - User profile and preferences
   - Authentication and RBAC
   - Settings plugin contributions
   - Organization management

6. **Business App** (port 4005) - Remote microfrontend for business features

   - Productions management
   - Studio scheduling and availability
   - Webinars and events
   - Member settings

7. **Growth App** (port 4006) - Remote microfrontend for growth features
   - User activation and onboarding
   - Monetization and purchase flows
   - AI credits management
   - Billing and subscriptions

### Shared Libraries

Located in `/packages/`, these libraries are shared across all microfrontends:

- **@riverside/media-core** - Shared media domain
- **@riverside/identity-core** - Identity & auth domain
- **@riverside/api-clients** - HTTP client layer
- **@riverside/state-management** - State utilities
- **@riverside/player-bindings** - Player integration
- **@riverside/file-upload** - File upload integration
- **@riverside/websocket-client** - Real-time communication
- **@riverside/analytics** - Analytics utilities
- **@riverside/settings-core** - Settings plugin system
- **@riverside/graphql** - SDK for graphql interface
- **@riverside/observability** - SDK for RUM, logger and metrics
- **@riverside/rollout-control** - SDK for FF abstraction layer

These are configured as singleton shared dependencies in Module Federation to ensure consistency across microfrontends.

### Repository Structure

```
riverside-quantum/     # Main monorepo
├── apps/
│   ├── shell/         # Shell application
│   ├── projects/      # Projects MFE
│   ├── studio/        # Studio MFE
│   ├── editor/        # Editor MFE
│   ├── account/       # Account MFE
│   ├── business/      # Business MFE
│   └── growth/        # Growth MFE
├── packages/
│   ├── @riverside/media-core/         # Shared media domain
│   ├── @riverside/identity-core/      # Identity & auth domain
│   ├── @riverside/api-clients/        # HTTP client layer
│   ├── @riverside/state-management/   # State utilities
│   ├── @riverside/player-bindings/    # Player integration
│   ├── @riverside/file-upload/        # File upload integration
│   ├── @riverside/websocket-client/   # Real-time communication
│   ├── @riverside/analytics/          # Analytics utilities
│   ├── @riverside/settings-core/      # Settings plugin system
│   ├── @riverside/graphql/            # SDK for graphql interface
│   ├── @riverside/observability/      # SDK for RUM, logger and metrics
│   └── @riverside/rollout-control/    # SDK for FF abstraction layer
└── tools/
    ├── scripts/            # Deployment and versioning scripts
    ├── build-tools/        # Custom build utilities
    └── test-utils/         # Testing utilities
```

### Technology Stack

- **Build Tool**: Rsbuild (Rust-based, faster alternative to Webpack) with native Module Federation support
- **Framework**: React 19.0.0 with TypeScript
- **Monorepo Management**: Nx with dependency graph analysis and incremental builds
- **State Management**: Zustand
- **Routing**: React Router DOM 6.29.0
- **Testing**: Vitest with React Testing Library (3-5x faster test execution)
- **Monorepo**: Nx with pnpm workspaces

### Key Configuration Files

- `nx.json` - Nx workspace configuration with task definitions and caching
- `tsconfig.base.json` - Base TypeScript config with path aliases
- `rsbuild.config.ts` (in each app) - Module Federation and build configuration
- `vitest.config.ts` (in each app) - Test configuration

## Module Federation Architecture

MFEs expose both full pages and embeddable widgets:

```ts
// Projects MFE exposes multiple entry points
exposes: {
  // Full pages
  './pages/ProjectsPage': './src/pages/ProjectsPage',

  // Widgets for composition
  './widgets/QuickCreateCard': './src/widgets/QuickCreateCard',
  './widgets/RecentProjectsList': './src/widgets/RecentProjectsList',

  // Settings panels
  './settings/GeneralSettings': './src/settings/GeneralSettings'
}
```

### Settings Plugin System

```ts
export interface SettingsPlugin {
  id: string;
  title: string;
  category: SettingsCategory;
  component: React.ComponentType;
  permissions?: string[];
  validate?: (data: any) => ValidationResult;
}

// Each MFE registers its settings
registry.registerPlugin({
  id: 'studio-settings',
  title: 'Studio Settings',
  category: SettingsCategory.AUDIO_VIDEO,
  component: StudioSettingsPanel,
});
```

## MFE Loading Architecture

The project uses `@riversidefm/rollout-control` for dynamic MFE loading and `@riversidefm/state-management` for version resolution.

### Architecture Separation

- **State Management**: Handles version resolution with strategies (latest/rollback)
- **Rollout Control**: Handles Module Federation runtime and loading

### Usage Examples

```typescript
// MFELoader Component - Recommended approach
import { MFELoader } from '@riversidefm/rollout-control';
import { useMFEVersionString } from '@riversidefm/state-management';

function EditorRoute() {
  const version = useMFEVersionString('editor', 'latest');

  return <MFELoader mfeName="editor" modulePath="./App" version={version.version} fallback={<div>Loading Editor...</div>} onError={(error) => console.error('MFE Error:', error)} />;
}

// useMFE Hook - For custom implementations
import { useMFE } from '@riverside/rollout-control';
import { useMFEVersionString } from '@riverside/state-management';

function CustomLoader() {
  const version = useMFEVersionString('studio', 'latest');
  const { module, loading, error } = useMFE('studio', './StudioPage', version.version);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const Component = module.default || module;
  return <Component />;
}
```

### Version Resolution

Version strategy is determined by state-management and passed to rollout-control:

```typescript
// State management resolves version based on strategy
const version = useMFEVersionString('editor', 'latest'); // or 'rollback'

// Rollout control loads the specific version
<MFELoader mfeName="editor" version={version.version} />;
```

### Environment Configuration

Set these environment variables for LaunchDarkly integration:

- `REACT_APP_LD_CLIENT_ID` - Production LaunchDarkly client ID
- `REACT_APP_LD_CLIENT_ID_DEV` - Development LaunchDarkly client ID
- `REACT_APP_LD_CLIENT_ID_STAGING` - Staging LaunchDarkly client ID

### AWS Deployment Configuration

- `ROLE_TO_ASSUME` - AWS IAM role for OIDC authentication
- `S3_BUCKET_NAME` - Production S3 bucket (`development.app.riverside.fm`)
- `CDN_DOMAIN` - CDN domain (`dev.riverside.fm`)
- `AWS_REGION` - AWS region (e.g., `us-east-1`)

### Development Tools

In development mode, access the rollout control panel in the top-right corner to:

- Override MFE versions locally
- View current version information
- Access feature flag editor
- Debug MFE loading and caching

### Feature Flag Configuration

Key flags for MFE management:

- `studioMfeVersion` / `editorMfeVersion` - Version strings
- `mfeLoadingStrategy` - 'local' | 'cdn' | 'auto'
- `prTestingEnabled` - Enable PR version testing
- `mfeProgressiveRollout` - Progressive rollout configuration
- `mfeDebugMode` - Enable debug features in production

### Deployment Strategy

- Each microfrontend (MFE) is versioned independently using semantic versioning
- Automated CI/CD pipeline manages version bumps based on conventional commits
- Deployed to S3 bucket structure for development and testing:
- CDN domain: `dev.riverside.fm`
- S3 bucket structure for versioned deployments:

```
development.app.riverside.fm/              # Development bucket
├── builds/
│   └── mfe/                              # Micro-frontend assets
│       ├── <mfe-name>/
│       │   ├── 1.0.0/
│       │   │   ├── remoteEntry.js       # Module Federation entry
│       │   │   ├── main.[hash].js
│       │   │   ├── vendor.[hash].js
│       │   │   ├── runtime.[hash].js
│       │   │   └── assets/
│       │   │       ├── css/
│       │   │       └── images/
│       │   ├── 1.0.1/
│       │   └── pr-123/                  # PR builds (auto-expire)
└── _metadata/                           # Deployment metadata
    ├── versions.json                    # Current production versions
    ├── rollback/                        # Rollback configurations
    │   └── 2025-01-15-rollback.json
    └── deprecation/                     # Version deprecation notices
        └── schedule.json
```

## State Management Approach

WIP

## Observability Architecture

A comprehensive observability strategy is critical for maintaining system health and ensuring optimal user experience across our micro-frontend architecture. This section outlines the architecture for a shared observability package that abstracts RUM (Real User Monitoring) tools and provides unified metrics collection across all micro-frontends.

### Objectives

- **User-Perceived Performance**: Track Core Web Vitals (LCP, FID, CLS, INP) and interaction flows across micro-frontends
- **Proactive Issue Detection**: Achieve MTTD < 5 minutes for critical user-facing issues
- **Rapid Resolution**: Target MTTR < 30 minutes for P1 incidents
- **Zero User Impact**: Resolve issues before they trigger support tickets through predictive alerting

### Shared Observability Package Architecture

```
packages/
├── @riverside/observability/
│   ├── src/
│   │   ├── core/
│   │   │   ├── types.ts              # Core observability types
│   │   │   ├── provider.interface.ts  # RUM provider interface
│   │   │   └── constants.ts          # Constants and defaults
│   │   ├── providers/
│   │   │   ├── datadog/
│   │   │   │   ├── datadog.provider.ts
│   │   │   │   └── datadog.config.ts
│   │   │   └── provider.factory.ts
│   │   ├── collectors/
│   │   │   ├── global-error.collector.ts
│   │   │   ├── web-vitals.collector.ts
│   │   │   └── console.collector.ts
│   │   ├── utils/
│   │   │   ├── error.normalizer.ts    # Error normalization
│   │   │   ├── stack.parser.ts       # Stack trace parsing
│   │   │   ├── fingerprint.ts        # Error fingerprinting
│   │   │   └── logger.factory.ts     # Logger creation
│   │   ├── context/
│   │   │   └── ObservabilityContext.tsx # React context
│   │   ├── lib/
│   │   │   └── observability.ts      # Main class
│   │   └── index.ts
│   └── package.json
```

### Core Error Normalization

The observability package normalizes all errors to a consistent format:

```typescript
export interface NormalizedError {
  type: 'network' | 'timeout' | 'manifest' | 'module' | 'version' | 'security' | 'unknown';
  message: string;
  stack?: string;
  fingerprint: string;
  severity: 'error' | 'warning' | 'critical';
  timestamp: number;
  context: ErrorContext;
  tags: Record<string, string | number | boolean>;
  breadcrumbs: Breadcrumb[];
  originalError?: unknown;
  troubleshooting?: string[];
  // HTTP and MFE specific fields
  statusCode?: number;
  mfeName?: string;
  mfeVersion?: string;
  loadingPhase?: string;
}
```

### Shell Application Integration

The Shell provides observability to all MFEs via React context:

```typescript
// apps/shell/src/app/app.tsx
import { ObservabilityProvider } from '@riverside/observability';

export function App() {
  const observabilityConfig = {
    provider: 'datadog',
    providerConfig: {
      clientToken: process.env.DATADOG_CLIENT_TOKEN,
      applicationId: process.env.DATADOG_APPLICATION_ID,
      site: 'datadoghq.com',
      service: 'riverside-frontend',
      env: process.env.NODE_ENV,
    },
    enableGlobalErrorCollection: true,
    enableWebVitals: true,
    enableInteractionTracking: true,
    mfeContext: {
      name: 'shell',
      version: process.env.SHELL_VERSION,
    },
  };

  return (
    <ObservabilityProvider config={observabilityConfig}>
      <ModuleFederationProvider>
        <Router>{/* Shell routes and MFE loading */}</Router>
      </ModuleFederationProvider>
    </ObservabilityProvider>
  );
}
```

### MFE Integration

Each MFE uses the observability context:

```typescript
// apps/studio/src/pages/StudioPage.tsx
import { useLogger, useObservability } from '@riverside/observability';

export function StudioPage() {
  const logger = useLogger('studio');
  const observability = useObservability();

  useEffect(() => {
    // Set MFE-specific context
    observability.setContext({
      mfe: 'studio',
      version: process.env.STUDIO_VERSION,
    });

    // Track MFE load
    observability.trackMFELoad({
      mfe: 'studio',
      version: process.env.STUDIO_VERSION,
      loadTime: performance.now(),
      loadType: 'initial',
      modulesFetched: 1,
      failed: false,
      source: 'local',
    });
  }, [observability]);

  const handleAction = async () => {
    try {
      await someAsyncAction();
    } catch (error) {
      logger.error('Action failed', { error, action: 'someAction' });
    }
  };

  return <div>Studio Content</div>;
}
```

### Rollout Control Integration

The rollout-control package uses observability for MFE loading:

```typescript
// packages/rollout-control/src/mfe/loader.ts
import { getObservability, normalizeError } from '@riverside/observability';

export class MFELoader {
  private observability = getObservability();
  private logger = this.observability.createLogger('mfe-loader');

  async loadMFE(mfeName: string, version: string): Promise<MFELoadResult> {
    const startTime = Date.now();

    try {
      const result = await this.attemptLoad(mfeName, version);

      // Track successful load
      this.observability.trackMFELoad({
        mfe: mfeName,
        version,
        loadTime: Date.now() - startTime,
        loadType: 'initial',
        modulesFetched: 1,
        failed: false,
        source: result.source,
      });

      return result;
    } catch (error) {
      // Normalize and track error
      const normalizedError = this.handleMFEError(error, {
        mfeName,
        version,
        phase: 'loading',
        loadType: 'initial',
      });

      throw normalizedError;
    }
  }

  private handleMFEError(error: unknown, context: MFEErrorContext): NormalizedError {
    const normalizedError = this.observability.normalizeError(error, {
      mfe: context.mfeName,
      mfeVersion: context.version,
      source: 'mfe-loader',
      loadingPhase: context.phase,
    });

    this.observability.trackMFEError(context.mfeName, normalizedError);
    return normalizedError;
  }
}
```

### Key Features

1. **Comprehensive Error Normalization**: All errors are normalized to a consistent format with rich context
2. **Automatic Error Collection**: Global error handlers capture unhandled errors and promise rejections
3. **MFE-Specific Tracking**: Specialized tracking for MFE loading performance and errors
4. **React Integration**: Context-based integration for React components
5. **Stack Trace Processing**: Clean, readable stack traces with application code highlighted
6. **Error Fingerprinting**: Consistent error grouping for monitoring tools
7. **Breadcrumb Tracking**: Automatic breadcrumb collection for debugging context
8. **Performance Monitoring**: Web Vitals and custom metrics tracking
9. **Troubleshooting Guidance**: Automatic generation of troubleshooting steps
10. **Provider Abstraction**: Easy switching between monitoring providers (Datadog, Console, etc.)

### Success Metrics

| Metric                            | Target                             | Measurement       |
| --------------------------------- | ---------------------------------- | ----------------- |
| Core Web Vitals (75th percentile) | LCP < 2.5s, CLS < 0.1, INP < 200ms | RUM data          |
| MFE Load Time                     | < 3s for 95th percentile           | Custom metrics    |
| MTTD (Mean Time to Detection)     | < 5 minutes                        | Incident tracking |
| MTTR (Mean Time to Resolution)    | < 30 minutes                       | Incident tracking |
| Error Rate                        | < 0.1%                             | Error tracking    |
| Availability                      | > 99.9%                            | Uptime monitoring |

This architecture provides a unified observability layer across all micro-frontends while maintaining flexibility to switch between RUM providers and ensuring comprehensive monitoring of both user experience and system health metrics.

## Testing Best Practices

### Frontend Testing with Vite and Vitest

We use Vitest for unit and integration testing due to its superior performance and ESM support.

#### Testing Structure

- **Unit Tests**: Located alongside components in `__tests__` directories
- **Integration Tests**: Located in `tests/integration` directories within each app
- **E2E Tests**: Located in `apps/e2e` using Playwright

#### Functional Testkit Approach

We use functional testkits (not class-based) following Testing Library API patterns to create robust, maintainable tests:

1. **Functional Testing**: Create testkit functions that expose a clean API to test logic
2. **Separation of Concerns**: Testkits handle the "how" of testing, while tests focus on the "what"
3. **Component Encapsulation**: Hide implementation details from tests to make them resilient to UI changes
4. **Testing Library Integration**: Use `within()` and standard Testing Library queries

#### Example Functional Testkit

```tsx
// Button component functional testkit
import { within, fireEvent } from '@testing-library/react';

export const createButtonTestkit = (container: HTMLElement) => {
  const getButton = () => within(container).getByTestId('button');

  return {
    // User actions
    click: () => {
      fireEvent.click(getButton());
    },

    // State queries
    isDisabled: () => {
      return getButton().hasAttribute('disabled');
    },

    getText: () => {
      return getButton().textContent || '';
    },

    hasClass: (className: string) => {
      return getButton().classList.contains(className);
    },

    // Visibility checks
    isVisible: () => {
      try {
        getButton();
        return true;
      } catch {
        return false;
      }
    }
  };
};
```

#### Example Test Using Functional Testkit

```tsx
// Example test using functional testkit
import { render } from '@testing-library/react';
import { createButtonTestkit } from './Button.testkit';
import Button from './Button';

describe('Button', () => {
  it('should call onClick when clicked', () => {
    const onClick = vi.fn();
    const { container } = render(<Button onClick={onClick}>Click Me</Button>);

    const testkit = createButtonTestkit(container);
    testkit.click();

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    const { container } = render(<Button disabled>Click Me</Button>);

    const testkit = createButtonTestkit(container);

    expect(testkit.isDisabled()).toBe(true);
  });
});
```

#### Best Practices for Functional Testkits

1. **Consistent API**: Maintain a consistent API across testkits for similar components
2. **Function Factories**: Use functions that accept container as parameter and return testkit object
3. **Encapsulation**: Hide implementation details and DOM queries inside the testkit
4. **Composition**: Compose complex testkits from simpler ones
5. **Testing Library Integration**: Use `within(container)` for scoped queries
6. **Scoped Selectors**: Use data-testid attributes for reliable component selection
7. **Reusable Assertions**: Include common assertions and state queries in the testkit
8. **User-Focused Actions**: Expose actions that match user behavior, not implementation details

#### Vitest Configuration

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  plugins: [react(), nxViteTsPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['**/node_modules/**', '**/test-setup.ts'],
    },
    cache: {
      dir: '../../node_modules/.vitest',
    },
  },
});
```

### Integration Testing Between MFEs

For testing interactions between microfrontends:

1. **Mock Module Federation**: Use the `@module-federation/utilities` package to mock remote modules
2. **MFE Test Drivers**: Create high-level drivers that encapsulate entire MFE behavior
3. **Composite Tests**: Test Shell + MFE integrations using composite test drivers

Example integration test setup:

```tsx
// Integration test for Shell loading Studio MFE
import { render } from '@testing-library/react';
import { mockRemoteModule } from '@module-federation/utilities';
import { ShellDriver } from '../drivers/shell.driver';
import Shell from './Shell';

// Mock Studio MFE
mockRemoteModule('studio', {
  './StudioPage': () => <div data-testid="mock-studio-page">Studio MFE</div>,
});

describe('Shell with Studio MFE', () => {
  it('should load Studio MFE when navigating to studio route', async () => {
    const { container } = render(<Shell />);

    const shellDriver = ShellDriver.fromContainer(container);
    await shellDriver.navigation.navigateTo('/studio');

    expect(shellDriver.content.hasElement('[data-testid="mock-studio-page"]')).toBe(true);
  });
});
```

## Documentation Standards

### Documentation Strategy

We maintain documentation at multiple levels:

1. **Repository-Level**: High-level architecture and development guides
2. **Package-Level**: Package-specific APIs and usage examples
3. **Component-Level**: Component documentation with examples
4. **Integration-Level**: Cross-MFE integration guides

### Component Documentation Standards

For each significant component, include:

````tsx
/**
 * Button component for user interactions.
 *
 * @example
 * ```tsx
 * <Button variant="primary" onClick={handleClick}>
 *   Click Me
 * </Button>
 * ```
 *
 * @property {string} variant - Button visual style: 'primary', 'secondary', or 'text'
 * @property {() => void} onClick - Function called when button is clicked
 * @property {boolean} disabled - Whether the button is disabled
 * @property {ReactNode} children - Button content
 */
export const Button = ({ variant, onClick, disabled, children }: ButtonProps) => {
  // Component implementation
};
````

### API Documentation

For shared libraries, document APIs with examples:

````ts
/**
 * MFELoader component for dynamically loading microfrontends.
 *
 * This component handles loading a microfrontend module dynamically,
 * with support for versioning, fallback content, and error handling.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <MFELoader
 *   mfeName="studio"
 *   modulePath="./StudioPage"
 *   fallback={<LoadingSpinner />}
 * />
 *
 * // With version and error handling
 * <MFELoader
 *   mfeName="editor"
 *   modulePath="./EditorPage"
 *   version="1.2.3"
 *   fallback={<LoadingSpinner />}
 *   onError={(error) => console.error('Failed to load MFE:', error)}
 * />
 * ```
 */
export const MFELoader = ({ mfeName, modulePath, version, fallback, onError }: MFELoaderProps) => {
  // Implementation
};
````

### Integration Documentation

For MFE integrations, provide clear examples:

````markdown
# Editor Integration with Shell

This document describes how the Editor MFE integrates with the Shell application.

## Module Federation Configuration

The Editor MFE exposes the following modules:

- `./pages/EditorPage`: Main editor page
- `./widgets/TimelineWidget`: Embeddable timeline widget
- `./settings/EditorSettings`: Editor settings panel

## Usage in Shell

```tsx
// Loading the Editor MFE in the Shell
import { MFELoader } from '@riverside/rollout-control';

const EditorPageLoader = () => <MFELoader mfeName="editor" modulePath="./pages/EditorPage" fallback={<EditorSkeleton />} />;
```
````

## State Integration

The Editor MFE connects to the Shell's state management through:

1. The `@riverside/state-management` package for global state
2. Event bus subscriptions for cross-MFE communication

## When modifying the Module Federation setup, ensure that:

1. Shared dependencies remain consistent across all apps
2. Remote URLs in development match the configured ports
3. Singleton packages (React, Redux) maintain version compatibility
4. The rollout-control package is properly initialized in the shell app

## Studio App Migration from riverside.fm-webapp

### Migration Requirements

The Studio App migration follows a component-by-component approach to migrate the existing studio-app from `riverside.fm-webapp` to the new MFE architecture in `riverside-quantum`. The migration maintains core functionality while modernizing the tech stack.

#### Key Migration Goals

- **Modern State Management**: Replace Redux with Zustand for simpler state management
- **Modern Styling**: Replace Material-UI with @emotion/react for CSS-in-JS
- **Component Architecture**: Maintain existing component hierarchy and functionality
- **Testing Strategy**: Implement comprehensive tests using functional testkits
- **Module Federation**: Expose studio components as federated modules

### Migration Process

#### Phase 1: Lobby Component Migration (COMPLETED)

**Original Source**: `/Users/saarkuriel/dev/riverside.fm-webapp/apps/riverside-fe/src/studio-app/components/StudioApp/index.tsx`

**Components Migrated**:
1. `LobbyPage` - Main lobby container with permission handling
2. `LobbyWelcome` - Welcome section with error messaging
3. `LobbyHeader` - Studio header with branding
4. `LobbyFooter` - Footer with links and info
5. `HardwareSetup` - Main hardware configuration section
6. `HardwareSetupCamera` - Camera selection and preview
7. `LobbyDevicesSelector` - Audio/video device selectors
8. `JoinStudioButton` - Primary action button
9. `RequestPermissionsButton` - Permission request button
10. `PermissionsScreen` - Permission status screen
11. `AskForHeadphones` - Headphones recommendation component

**Key Technical Changes**:
- **State Management**: Migrated from Redux to Zustand stores
  - `useLobbyStore` - Main lobby state (permissions, errors, device access)
  - `useDeviceStore` - Device enumeration and selection
- **Styling**: Replaced Material-UI with @emotion/react CSS-in-JS
- **Simplified Features**: Removed complex branding, mobile flows, and producer features
- **Modern Patterns**: Updated to React 19 patterns and hooks

#### Folder Structure Implementation

Each component follows a consistent folder structure:

```
apps/studio/src/components/lobby/
├── LobbyPage/
│   ├── LobbyPage.tsx          # Component implementation
│   ├── LobbyPage.styles.ts    # Emotion CSS styles
│   ├── LobbyPage.testkit.ts   # Functional testkit
│   ├── LobbyPage.spec.tsx     # Unit tests
│   └── index.ts               # Barrel export
├── AskForHeadphones/
│   ├── AskForHeadphones.tsx
│   ├── AskForHeadphones.styles.ts
│   ├── AskForHeadphones.testkit.ts
│   ├── AskForHeadphones.spec.tsx
│   └── index.ts
└── [... other components]
```

#### Functional Testkit Pattern

We use functional testkits instead of class-based ones, following Testing Library API patterns:

```typescript
// Example testkit structure
export const createAskForHeadphonesTestkit = (container: HTMLElement) => {
  const getNotUsingButton = () => within(container).getByTestId('not-using-headphones-btn');
  const getUsingButton = () => within(container).getByTestId('using-headphones-btn');

  return {
    // User actions
    selectNotUsingHeadphones: () => {
      fireEvent.click(getNotUsingButton());
    },
    selectUsingHeadphones: () => {
      fireEvent.click(getUsingButton());
    },
    
    // State queries
    getSelectedOption: (): 'yes' | 'no' | null => {
      if (getNotUsingButton().classList.contains('selected')) return 'no';
      if (getUsingButton().classList.contains('selected')) return 'yes';
      return null;
    },
    
    // Visibility checks
    isVisible: () => {
      try {
        within(container).getByTestId('ask-for-headphones');
        return true;
      } catch {
        return false;
      }
    }
  };
};
```

#### Testing Best Practices for Migration

1. **User-Focused Testing**: Tests focus on user behavior, not implementation details
2. **Functional Testkits**: Use functions instead of classes for testkits
3. **Vitest Configuration**: Use `vi.mock` and `vi.fn()` instead of Jest equivalents
4. **Test Structure**: Each component has comprehensive unit tests covering core functionality
5. **Mock Management**: Proper mocking of Zustand stores and browser APIs

### Next Migration Steps

#### Phase 2: Recording Session Components
- `RecordingControls` - Start/stop/pause recording
- `ParticipantsList` - Manage participants
- `ChatPanel` - In-session messaging
- `ScreenShare` - Screen sharing functionality

#### Phase 3: Advanced Studio Features
- `VirtualBackgrounds` - Background effects
- `AudioEffects` - Real-time audio processing
- `StreamingControls` - Live streaming setup
- `ProducerMode` - Producer-specific features

#### Phase 4: Integration Components
- `StudioSettings` - Studio configuration
- `BrandingCustomization` - Custom branding
- `WebhookIntegration` - External integrations
- `AnalyticsDashboard` - Studio analytics

### Migration Guidelines for Future Components

#### 1. Analysis Phase
- Read original component from `riverside.fm-webapp`
- Identify all dependencies (Redux stores, Material-UI components, etc.)
- Map out state management patterns
- Identify complex features that can be simplified

#### 2. Migration Phase
- Create component folder structure
- Implement component with @emotion/react styling
- Convert Redux to Zustand state management
- Simplify complex flows where possible
- Maintain core functionality and user experience

#### 3. Testing Phase
- Create functional testkit following established patterns
- Write comprehensive unit tests covering user behavior
- Test integration with other lobby components
- Verify styling matches original design

#### 4. Integration Phase
- Update imports in parent components
- Test Module Federation exposure if needed
- Verify build and runtime functionality
- Document any API changes or new patterns

### Package Management

**IMPORTANT**: This monorepo uses package.json ONLY at the root level. Do not create package.json files in individual apps or packages. All dependencies are managed through the root package.json with pnpm workspaces.

To add dependencies for a specific app or package:
```bash
# Add to specific workspace
pnpm add <package> --filter=<workspace-name>

# Example for studio app
pnpm add @emotion/react --filter=studio
```

## Version Management and Deployment

The project uses an automated CI/CD pipeline for version management:

### Key Components

- **Conventional Commits**: Automatic version bumping based on commit messages
- **AWS OIDC Authentication**: Secure deployment using IAM roles
- **S3 Deployment**: Versioned builds deployed to `development.app.riverside.fm/builds/mfe/`
- **Deployment Scripts**: Located in `tools/scripts/` for manual operations

### Manual Operations

```bash
# Force version bump for specific MFEs
node tools/scripts/bump-version.js shell studio

# Deploy specific MFE
node tools/scripts/deploy-mfe.js studio 2.1.0 apps/studio/dist

# Update deployment metadata
node tools/scripts/update-metadata.js --production '{"studio": "2.1.0"}'
```
