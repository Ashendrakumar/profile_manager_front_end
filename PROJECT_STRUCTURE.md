# Project Structure

This document outlines the complete folder structure of the Profile Manager.

## Directory Tree

```
ReactWebApp/
├── public/                    # Static assets
│   ├── favicon.svg           # Application favicon
│   └── vite.svg              # Vite logo (default)
│
├── src/                      # Source code
│   ├── modules/              # Feature-based modules
│   │   ├── home/
│   │   │   └── pages/
│   │   │       └── HomePage.tsx
│   │   ├── about/
│   │   │   └── pages/
│   │   │       └── AboutPage.tsx
│   │   ├── users/
│   │   │   ├── pages/
│   │   │   │   ├── UsersPage.tsx
│   │   │   │   └── UserDetailPage.tsx
│   │   │   └── services/
│   │   │       └── userService.ts
│   │   └── notFound/
│   │       └── pages/
│   │           └── NotFoundPage.tsx
│   │
│   ├── common/               # Shared/common components
│   │   └── components/
│   │       ├── ErrorBoundary.tsx
│   │       ├── LoadingSpinner.tsx
│   │       └── index.ts
│   │
│   ├── layouts/              # Layout components
│   │   ├── MainLayout.tsx
│   │   └── index.ts
│   │
│   ├── hooks/                # Custom React hooks
│   │   ├── useMetadata.ts
│   │   └── index.ts
│   │
│   ├── services/             # API services
│   │   └── api.ts           # Axios instance with interceptors
│   │
│   ├── utils/                # Utility functions
│   │   ├── index.ts
│   │   └── metadata.ts      # SEO/metadata helpers
│   │
│   ├── constants/            # Application constants
│   │   └── index.ts
│   │
│   ├── theme/                # Material UI theme
│   │   └── index.ts
│   │
│   ├── routes/               # Route configuration
│   │   └── index.tsx
│   │
│   ├── App.tsx               # Root component
│   ├── main.tsx              # Entry point
│   ├── index.css             # Global styles
│   └── vite-env.d.ts         # Vite environment types
│
├── index.html                # HTML template
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── tsconfig.node.json        # TypeScript config for Vite
├── vite.config.ts            # Vite configuration
├── .gitignore               # Git ignore rules
├── README.md                 # Project documentation
└── PROJECT_STRUCTURE.md      # This file
```

## Module Structure Pattern

Each module follows this structure:

```
moduleName/
├── pages/              # Page components
│   └── ModulePage.tsx
├── components/         # Module-specific components (optional)
│   └── ComponentName.tsx
├── services/           # Module-specific API services (optional)
│   └── moduleService.ts
├── hooks/              # Module-specific hooks (optional)
│   └── useModuleHook.ts
└── types/              # Module-specific types (optional)
    └── moduleTypes.ts
```

## Key Files Explained

### Configuration Files

- **vite.config.ts**: Vite build configuration with path aliases
- **tsconfig.json**: TypeScript compiler configuration
- **package.json**: Project dependencies and npm scripts

### Core Application Files

- **src/main.tsx**: Application entry point
- **src/App.tsx**: Root component with routing setup
- **src/index.css**: Global CSS styles

### Routing

- **src/routes/index.tsx**: Centralized route configuration with lazy loading and metadata

### API Layer

- **src/services/api.ts**: Axios instance with:
  - Request interceptor (auth token attachment)
  - Response interceptor (global error handling)
  - Typed API service methods (get, post, put, patch, delete)

### Theme

- **src/theme/index.ts**: Material UI theme configuration with:
  - Light and dark theme options
  - Custom color palette
  - Component overrides

### Utilities

- **src/utils/metadata.ts**: SEO/metadata management (page titles, meta tags)
- **src/utils/index.ts**: Common utility functions (date formatting, debounce, etc.)

### Constants

- **src/constants/index.ts**: Application-wide constants (API URLs, routes, storage keys, etc.)

### Hooks

- **src/hooks/useMetadata.ts**: Custom hook for managing page metadata

### Layouts

- **src/layouts/MainLayout.tsx**: Main application layout with navigation

### Common Components

- **src/common/components/LoadingSpinner.tsx**: Reusable loading spinner
- **src/common/components/ErrorBoundary.tsx**: React error boundary component

## Path Aliases

The project uses path aliases for cleaner imports:

- `@/*` → `src/*`
- `@/modules/*` → `src/modules/*`
- `@/common/*` → `src/common/*`
- `@/layouts/*` → `src/layouts/*`
- `@/hooks/*` → `src/hooks/*`
- `@/services/*` → `src/services/*`
- `@/utils/*` → `src/utils/*`
- `@/constants/*` → `src/constants/*`
- `@/theme/*` → `src/theme/*`
- `@/routes/*` → `src/routes/*`

## Adding a New Module

1. Create module folder: `src/modules/myModule/`
2. Create page: `src/modules/myModule/pages/MyModulePage.tsx`
3. Create service (if needed): `src/modules/myModule/services/myModuleService.ts`
4. Add route in `src/routes/index.tsx`
5. Update navigation in `src/layouts/MainLayout.tsx` (if needed)

## Best Practices

1. **Module Organization**: Keep related code together in modules
2. **Reusability**: Extract common logic to hooks, utils, or common components
3. **Type Safety**: Always use TypeScript types/interfaces
4. **Lazy Loading**: Use lazy loading for routes to improve performance
5. **Error Handling**: Use try-catch blocks and error boundaries
6. **Constants**: Store magic strings/numbers in constants file
7. **Comments**: Document complex logic and architectural decisions
