# Render SPA Hard Refresh (BrowserRouter) - TODO

Your app uses `react-router-dom` with `BrowserRouter`, so on a hard refresh of a client route (example: `/users/123`), the Render Static Site must serve your built `index.html` instead of returning a 404.

## What to do (Render Dashboard)
1. Open your Render service.
2. Go to `Settings` -> `Redirects and Rewrites`.
3. Add a rewrite rule with:
   - `Source Path`: `/*`
   - `Destination Path`: `/index.html`
   - `Action`: `Rewrite`
4. Keep this rule broad (and if you have other rules, ensure this one isn’t shadowed).

Notes:
- Use `Rewrite` (not `Redirect`), so the browser URL stays `/users/123` and React Router can render the correct route.
- Render does not apply redirect/rewrite rules when a real file already exists at the requested path.

## Optional: use the same idea with Render Blueprint
In a `render.yaml`, under the static site service `routes:` field, add a rewrite like:
```yaml
routes:
  - type: rewrite
    source: /*
    destination: /index.html
```

## If it still fails: add explicit prefix fallbacks
As a fallback, add `Rewrite` rules for route prefixes used by your app (examples):
```yaml
routes:
  - type: rewrite
    source: /login/*
    destination: /index.html
  - type: rewrite
    source: /login
    destination: /index.html
  - type: rewrite
    source: /about/*
    destination: /index.html
  - type: rewrite
    source: /users/*
    destination: /index.html
  - type: rewrite
    source: /profile
    destination: /index.html
```

## Repo note
This repo previously contained a Netlify-style `public/_redirects`, but Render static sites use Dashboard/Blueprint rules. This file was removed to avoid confusion.

