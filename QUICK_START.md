# Quick Start Guide

## Installation

1. Install dependencies:

```bash
npm install
```

2. (Optional) Create `.env` file for API configuration:

```bash
# Copy the example file
cp .env.example .env

# Edit .env and set your API base URL
VITE_API_BASE_URL=http://localhost:3000/api
```

## Running the Application

### Development Mode

```bash
npm run dev
```

Opens at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## Project Features

✅ **React 18+ with TypeScript** - Latest React with full type safety  
✅ **Vite** - Lightning-fast build tool  
✅ **React Router 6+** - Client-side routing with lazy loading  
✅ **Material UI v5** - Beautiful, customizable components  
✅ **Axios** - HTTP client with interceptors  
✅ **Centralized API Layer** - Request/response interceptors for auth & error handling  
✅ **SEO Support** - Dynamic page titles and meta tags  
✅ **Module-based Architecture** - Scalable folder structure  
✅ **Path Aliases** - Clean imports with `@/` prefix  
✅ **Theme Customization** - Easy MUI theme customization  
✅ **Error Boundaries** - Graceful error handling  
✅ **TypeScript Strict Mode** - Maximum type safety

## Key Files to Know

- **`src/App.tsx`** - Root component with routing
- **`src/routes/index.tsx`** - Route configuration
- **`src/services/api.ts`** - API client setup
- **`src/theme/index.ts`** - Material UI theme
- **`src/utils/metadata.ts`** - SEO/metadata utilities
- **`src/modules/`** - Feature modules

## Example: Using the API Service

```typescript
import { apiService } from "@/services/api";

// GET request
const users = await apiService.get<User[]>("/users");

// POST request
const newUser = await apiService.post<User>("/users", userData);
```

## Example: Creating a New Page

1. Create page: `src/modules/myModule/pages/MyPage.tsx`
2. Add route in `src/routes/index.tsx`
3. Use `useMetadata` hook for SEO:

```typescript
import { useMetadata } from "@/hooks";

const MyPage = () => {
  useMetadata({
    title: "My Page - Profile Manager",
    description: "Page description",
  });

  return <div>My Content</div>;
};
```

## Demo API

The project is configured to use JSONPlaceholder API by default for demonstration:

- Base URL: `https://jsonplaceholder.typicode.com`
- Try the Users page to see it in action!

## Next Steps

1. Update `src/constants/index.ts` with your API URL
2. Customize `src/theme/index.ts` for your brand colors
3. Add your modules in `src/modules/`
4. Update routes in `src/routes/index.tsx`

For detailed documentation, see `README.md` and `PROJECT_STRUCTURE.md`.
