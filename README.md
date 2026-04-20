# Monorepo Template

Nx-based monorepo template for business domain teams at Riverside. Use this to create a new domain repository with MFEs and internal packages.

## Structure

```
your-domain/
├── apps/                      # Microfrontends
│   └── mfe/                   # Example MFE (copy this to create new ones)
├── packages/                  # Internal packages (shared within this repo only)
│   └── hello-world/           # Example package
├── services/                  # Backend services (optional)
├── nx.json                    # Nx workspace config
└── pnpm-workspace.yaml        # PNPM workspaces
```

## Understanding `packages/`

The `packages/` directory contains **internal packages** for code sharing within your repo:

- **Not published to npm** - Only used inside this repository
- **Not consumed by other repos** - For cross-repo sharing, use `riverside-frontend-packages`
- **Team-scoped** - Your team's shared utilities, components, types

**Examples:**
- `packages/ui/` - Team-specific UI components
- `packages/utils/` - Shared utilities
- `packages/types/` - TypeScript types used across your MFEs

These are available via TypeScript path aliases (e.g., `@your-domain/ui`).

## Quick Start

```bash
pnpm install
pnpm nx serve mfe          # Start example MFE
pnpm test:all              # Run tests
pnpm build:all             # Build everything
```

---

## Creating a New MFE

Each MFE in your repo is a separately deployable microfrontend that can expose full pages, widgets, or settings panels.

### Option 1: New App (Separate MFE)

Use when you need independent versioning and deployment.

```bash
# 1. Copy the example MFE
cp -r apps/mfe apps/my-new-mfe

# 2. Update configuration files:
#    - rsbuild.config.ts → change `name: 'mfe'` to your MFE name
#    - micro-frontend.json → update name
#    - vitest.config.ts → update name and cache dir

# 3. Clean copied artifacts
rm -rf apps/my-new-mfe/dist apps/my-new-mfe/node_modules
```

**Do NOT use `nx generate`** for MFEs—it creates an incompatible structure.

### Option 2: Entry Point (Exposed Module)

Use when you want to add functionality to an existing MFE without separate versioning.

Add to your MFE's `rsbuild.config.ts`:

```typescript
exposes: {
  './App': './src/app/AppWrapper.tsx',
  './NewWidget': './src/widgets/NewWidget.tsx',  // Add new entry point
  './SettingsPanel': './src/settings/Panel.tsx'
}
```

### When to use which?

| Factor | New App | Entry Point |
|--------|---------|-------------|
| Versioning | Independent | Shared with parent MFE |
| Deployment | Separate CI/CD | Deploys with parent |
| Use case | Distinct feature area | Related functionality |

### Register in MFE Registry

After creating a new MFE, register it in [`riverside-frontend-packages`](https://github.com/riversidefm/riverside-frontend-packages):

**File**: `packages/rollout-control/src/mfe/registry.ts`

```typescript
export const MFE_REGISTRY = {
  // Add your MFE
  your_mfe: {
    defaultDevPort: 4XXX,  // Pick an unused port
    description: 'Your MFE description',
  },
};
```

Then publish a new version of `@riversidefm/rollout-control`.

### Required Files

Each MFE needs:

| File | Purpose |
|------|---------|
| `rsbuild.config.ts` | Module Federation + build config |
| `micro-frontend.json` | MFE metadata |
| `tsconfig.json` | TypeScript config |
| `vitest.config.ts` | Test config |

---

## Creating Internal Packages

For code shared within your repo (not published to npm):

```bash
# TypeScript library
pnpm nx g @nx/js:lib my-utils --directory=packages/my-utils --bundler=vite

# React component library
pnpm nx g @nx/react:lib my-ui --directory=packages/my-ui --bundler=vite
```

Package will be available as `@your-domain/my-utils` via TypeScript paths.

---

## Module Federation

Each MFE exposes modules that can be loaded by the Shell or other MFEs:

```typescript
// rsbuild.config.ts
exposes: {
  './App': './src/app/AppWrapper.tsx',           // Full page
  './widgets/Chart': './src/widgets/Chart.tsx',  // Embeddable widget
  './settings/Panel': './src/settings/Panel.tsx' // Settings panel
}
```

Shared dependencies prevent duplication:

```typescript
shared: {
  react: { singleton: true, eager: true },
  'react-dom': { singleton: true, eager: true },
}
```

---

## Functional Testkit Pattern

Use functional testkits for component testing:

```typescript
// Button.testkit.ts
export const createButtonTestkit = (container: HTMLElement) => {
  const getButton = () => within(container).getByTestId('button');

  return {
    click: () => fireEvent.click(getButton()),
    getText: () => getButton().textContent || '',
    isDisabled: () => getButton().hasAttribute('disabled'),
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

// Button.spec.tsx
describe('Button', () => {
  it('should handle click', () => {
    const onClick = vi.fn();
    const { container } = render(<Button onClick={onClick}>Click</Button>);
    const testkit = createButtonTestkit(container);

    testkit.click();
    expect(onClick).toHaveBeenCalled();
  });
});
```

---

## Commands

| Command | Description |
|---------|-------------|
| `pnpm nx serve <app>` | Start app in dev mode |
| `pnpm nx build <project>` | Build project |
| `pnpm nx test <project>` | Run tests |
| `pnpm affected:build` | Build only changed projects |
| `pnpm graph` | Visualize dependencies |

---

## Troubleshooting

### Local Development

```bash
# Clear Nx cache
pnpm nx reset
rm -rf node_modules
pnpm install

# Check MFE is accessible locally
curl http://localhost:4XXX/mf-manifest.json

# Verify build output
pnpm nx build my-mfe --verbose
cat apps/my-mfe/dist/mf-manifest.json
```

### Deployment Issues

After merge, if your MFE isn't updating:

1. **Check GitHub Actions** - Go to Actions tab, find the `mfe-deploy` workflow run for your commit
2. **Look for failures** - Each step (build, upload, sync, invalidate) should be green
3. **Check the logs** - Expand failed steps to see error messages

Common workflow issues:

| Problem | Where to look | Solution |
|---------|---------------|----------|
| Build failed | "Build MFE" step | Fix build errors locally first |
| No version bump | "Version Analysis" step | Use `feat:` or `fix:` commit prefix |
| Upload failed | "Upload to S3" step | Check AWS credentials in repo secrets |
| Tag not created | "Push Git Tags" step | Check branch protection rules |
| Old version showing | "Invalidate CloudFront" step | May need manual invalidation |

### Verify Deployment

```bash
# Check git tag was created
git fetch --tags
git tag -l "my-mfe@*" | tail -5

# Check MFE is accessible via CDN
curl -I https://${CDN_DOMAIN}/builds/mfe/my-mfe/latest/mf-manifest.json
```

### Module Federation Issues

```bash
# Verify mf-manifest.json exists in build output
cat apps/my-mfe/dist/mf-manifest.json

# Check the MFE name matches registry
grep -r "name:" apps/my-mfe/rsbuild.config.ts
```

---

## Tech Stack

- **Build**: Rsbuild + Module Federation
- **Monorepo**: Nx
- **Package Manager**: PNPM
- **Frontend**: React 18, TypeScript
- **Testing**: Vitest + React Testing Library

---

## Architecture Documentation

For the full MFE architecture documentation, see:
- [MFE Architecture Guide](https://github.com/riversidefm/riverside-quantum/blob/main/docs/MFE-GUIDE.md)
- [Versioning & Deployment](https://github.com/riversidefm/riverside-quantum/blob/main/docs/mfe-versioning-and-deployment.md)
