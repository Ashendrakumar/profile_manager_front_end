# Profile Manager

A production-ready Profile Managerlication built with the latest technologies and best practices.

## Tech Stack

- **React** 18+ - Latest React with TypeScript
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **React Router** 6+ - Client-side routing with lazy loading
- **Material UI (MUI)** v5+ - Beautiful, customizable components
- **Axios** - HTTP client for API requests

## Project Structure

```
src/
├── modules/           # Feature-based modules
│   ├── home/
│   ├── about/
│   ├── users/
│   └── notFound/
├── common/            # Shared components
│   └── components/
├── layouts/           # Layout components
├── hooks/             # Custom React hooks
├── services/          # API services
│   └── api.ts        # Axios instance with interceptors
├── utils/             # Utility functions
│   └── metadata.ts   # SEO/metadata helpers
├── constants/         # Application constants
├── theme/             # Material UI theme configuration
├── routes/            # Route configuration
├── App.tsx            # Root component
└── main.tsx           # Entry point
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file (optional):

```bash
cp .env.example .env
```

3. Update `.env` with your API base URL:

```
VITE_API_BASE_URL=http://localhost:3000/api
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

Build the application:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Features

### Architecture

- **Module-based folder structure** - Feature-based organization for scalability
- **TypeScript** - Full type safety throughout the application
- **Lazy loading** - Code splitting for optimal performance
- **Centralized routing** - Route configuration with metadata support

### API Layer

- **Axios instance** with interceptors
- **Request interceptor** - Automatically attaches auth tokens
- **Response interceptor** - Global error handling (401, 403, 500, etc.)
- **Type-safe API services** - Typed interfaces for all API calls

### UI/UX

- **Material UI** - Consistent design system
- **Customizable theme** - Easy theme customization
- **Responsive design** - Mobile-first approach
- **Loading states** - User-friendly loading indicators
- **Error boundaries** - Graceful error handling

### SEO & Metadata

- **Dynamic page titles** - Per-route title management
- **Meta tags** - SEO-friendly meta tags
- **Open Graph support** - Social media sharing
- **Favicon support** - Custom app icons

## Usage Examples

### Creating a New Module

1. Create a module folder:

```
src/modules/myModule/
├── pages/
│   └── MyModulePage.tsx
└── services/
    └── myModuleService.ts
```

2. Create a service:

```typescript
import { apiService } from "@/services/api";

export const myModuleService = {
  getData: async () => {
    return apiService.get("/my-endpoint");
  },
};
```

3. Create a page:

```typescript
import { useMetadata } from "@/hooks";

const MyModulePage = () => {
  useMetadata({
    title: "My Module - Profile Manager",
    description: "My module description",
  });

  return <div>My Module Content</div>;
};

export default MyModulePage;
```

4. Add route in `src/routes/index.tsx`:

```typescript
const MyModulePage = lazy(
  () => import("@/modules/myModule/pages/MyModulePage")
);

export const routes: AppRoute[] = [
  // ... existing routes
  {
    path: "/my-module",
    element: <MyModulePage />,
    metadata: {
      title: "My Module - Profile Manager",
      description: "My module description",
    },
  },
];
```

### Using the API Service

```typescript
import { apiService } from "@/services/api";

// GET request
const data = await apiService.get<User[]>("/users");

// POST request
const newUser = await apiService.post<User>("/users", userData);

// PUT request
const updatedUser = await apiService.put<User>(`/users/${id}`, userData);

// DELETE request
await apiService.delete(`/users/${id}`);
```

### Customizing the Theme

Edit `src/theme/index.ts` to customize colors, typography, and component styles:

```typescript
const lightThemeOptions: CustomThemeOptions = {
  palette: {
    primary: {
      main: "#your-color",
    },
    // ... other palette options
  },
  // ... other theme options
};
```

## Best Practices

- **TypeScript** - Always use types/interfaces for props and data
- **Error handling** - Use try-catch blocks for async operations
- **Loading states** - Show loading indicators during data fetching
- **Component organization** - Keep components small and focused
- **Code splitting** - Use lazy loading for routes
- **Constants** - Store magic strings/numbers in constants
- **Reusability** - Extract common logic into hooks and utilities

## Environment Variables

- `VITE_API_BASE_URL` - Base URL for API requests (default: https://jsonplaceholder.typicode.com for demo)

## Path Aliases

The project uses path aliases for cleaner imports:

- `@/*` - `src/*`
- `@/modules/*` - `src/modules/*`
- `@/common/*` - `src/common/*`
- `@/layouts/*` - `src/layouts/*`
- `@/hooks/*` - `src/hooks/*`
- `@/services/*` - `src/services/*`
- `@/utils/*` - `src/utils/*`
- `@/constants/*` - `src/constants/*`
- `@/theme/*` - `src/theme/*`
- `@/routes/*` - `src/routes/*`

## License

MIT

## Contributing

This is a production-ready template. Feel free to extend it based on your project requirements.
