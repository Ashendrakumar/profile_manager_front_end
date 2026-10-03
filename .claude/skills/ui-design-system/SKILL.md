---
name: ui-design-system
description: The Profile Manager UI/UX design system — teal-brand tokens, component patterns, auth flow, app shell, responsive rules and motion. Apply when building or restyling any React + TypeScript + MUI screen in this app so every page shares one language. Reference the full visual artifact at design/profile-manager-redesign.html.
---

# Profile Manager — UI/UX Design System v2.0

The single source of truth for how every screen looks and behaves. Built for
**React 18 + TypeScript + Vite + MUI 5**. When you build a new screen or restyle
an old one, map to these tokens instead of inventing values.

> **Visual artifact:** open `design/profile-manager-redesign.html` in a browser
> for the interactive, light/dark, responsive showcase of everything below.

---

## 1. Design principles

1. **One language everywhere.** Auth, dashboard and profile sections all use the
   same tokens, radii, shadows and motion. No screen is a special case.
2. **Token-driven.** Every value below maps to a MUI theme token in
   `src/theme/index.ts`. Change the token, not the component.
3. **Teal is the brand.** `primary.main = #00897b`. A warm coral accent
   (`#ff5a3c`) is reserved for high-energy CTAs only.
4. **Dark mode is native, not an afterthought.** Use theme tokens (`background.paper`,
   `divider`, `alpha(...)`) — never hard-coded hex in components.
5. **Motion is purposeful.** Hover lift, focus glow, page fade, ring fill. If an
   animation doesn't communicate state, drop it. Respect `prefers-reduced-motion`.
6. **Accessible by default.** AA contrast, visible focus rings, 44px min touch
   targets, `aria-label` on icon-only controls.

---

## 2. Tokens

### Color — teal brand scale
`50 #e6f6f4 · 100 #c2e9e4 · 200 #8fd6cd · 300 #4fbdb0 · 400 #26a698 · 500 #00968a · 600 #00897b (main) · 700 #00796b · 800 #00655a · 900 #004d40`

### Semantic
- Accent/CTA coral `#ff5a3c` · Success `#18b368` · Warning `#f5a524`
- Error `#f43f6e` · Info `#2e9bff` · Violet (tags) `#7c5cff`

### Surfaces
| Token | Light | Dark |
|---|---|---|
| bg (default) | `#f4f7f8` | `#0b1413` |
| surface (paper) | `#ffffff` | `#111d1b` |
| surface-2 | `#f8fafb` | `#0f1a19` |
| line (divider) | `#e1ecea` | `#22322f` |
| ink (text) | `#0f1e1c` | `#eaf4f2` |
| ink-3 (muted) | `#6c7c7a` | `#859894` |

### Radius · Spacing · Elevation · Motion
- Radius: `xs 8 · sm 12 · md 16 · lg 22 · pill 999`
- Spacing: 8px grid → `4 / 8 / 12 / 16 / 24 / 32`
- Shadows: `sm 0 2px 8px rgba(6,32,29,.06)` · `md 0 8px 24px rgba(6,32,29,.10)` ·
  `lg 0 20px 48px rgba(6,32,29,.16)` · teal-glow `0 12px 30px rgba(0,137,123,.28)`
- **Light-mode depth** (set in `MuiCssBaseline` + `modeTokens.light`): the page
  carries a fixed ambient brand wash — three teal radial gradients over
  `background.default` — and card elevation is a three-layer cast (hairline
  contact + mid diffusion + wide `rgba(0,137,123,…)` ambient). Together these
  are what lift white cards off the page; without the wash the tinted shadow
  has nothing to read against. Dark mode keeps a flat body — its depth comes
  from the surfaces themselves. **Never paint an opaque `background.default`
  over a full-page container** — it covers the wash; leave it transparent.
- Ease: `cubic-bezier(.22,.61,.36,1)` · Duration: `.28s` standard, `.4s` theme swap
- Brand gradient: `linear-gradient(135deg,#00b3a0,#00897b 55%,#00655a)`

### Type
- Display: **Sora** 600–800 (h1–h4, ring number)
- UI/body: **Inter** 400–700
- Scale: h1 40 · h2 32 · h4 20 · body 15 · caption 12 · letter-spacing -.02em on headings

---

## 3. Components (map to existing `src/common/components`)

| Pattern | Component | Rules |
|---|---|---|
| Buttons | `ResponsiveButton`, MUI `Button` | Primary = teal gradient + glow; Ghost = 1.5px outline; Coral = CTA only. Rounded-rectangle radius (`sm` = 12, matches inputs). `textTransform:none`. Hover `translateY(-2px)`. |
| Text input | `Input` | 1.5px border, radius sm. Focus = teal border + `0 0 0 4px teal-50` glow. Error = rose border + helper text. |
| Select / textarea | `Select`, `TextArea`, `TextEditor` | Same border/focus treatment. |
| Entity list item | `EntityCard` | Avatar/icon + title (+ `headerChip` inline) + subtitle, then **`metaChips`** (dates / status / counts), body, **`chips`** (tags, with optional `chipsLabel`), optional pinned `footer` for links + a read action. Facts and tags never share a row. Hover lift **only when clickable** (`onClick` set). |
| Grouped list | `SectionCard` | Title + count chip + optional header `action`; body is either `items`/`renderItem` or custom `children` (e.g. a tile grid). Use when the entity is too thin for a full card — see Skills. |
| Add / edit form | `SideDrawer` + `*Form` | Forms open in a right side drawer (react-hook-form + zod), never a full page. |
| Confirm destructive | `ConfirmDialog` | Rose primary action. |
| Loading | `SkeletonLoader`, `LoadingSpinner`, `TopProgressBar` | Skeleton on first load; keep old data + subtle spinner on refresh. |
| Feedback | `toastContext` | Success = green, error = rose, top-right, auto-dismiss. |
| Chips | MUI `Chip`, `EntityCardChip` | Three tones: `soft` (tinted fill, no border — the default for dense rows), `filled` (at most one per card, for live status), `outlined` (clickable links). Colours: teal (tech/tags), grey `default` (dates, counts), green (done/live), amber (pending/todo), violet (skills), rose (overdue/delete). Height 28, weight 600. |

---

## 4. Authentication flow

One **split-screen frame**: a constant branded aside (teal gradient, blobs,
logo, testimonial) + a right panel that morphs per step. Merge all four auth
screens into this one layout.

```
Login / Register  →  OTP verify  →  Google callback (loading)  →  Profile Completion
```

- **Login:** email + password, remember me, forgot link, divider, "Continue with Google", switch-to-register link. Lands on `ROUTES.PROFILE_COMPLETION`.
- **Register:** first/last name (2-col), work email, password + strength meter, switch-to-login.
- **OTP:** 6 individual code boxes (focus = teal glow), expiry timer, resend.
- **Google callback:** centered teal spinner + status chips; no aside form. Route stays **unguarded** (no token yet).

Guard flags live in `src/routes/index.tsx`: `isPublic` (redirect authed away),
`isProtected`, `requiresAdmin`.

---

## 5. App shell

Persistent layout = **grouped sidebar (236px) + glassy sticky app bar + content**.

- **Sidebar groups:** `Overview` (Dashboard, About, Users — admin) · `My Profile`
  (My Profile — completion + Personal + Contact + Resume, Education, Experience,
  Projects, Skills, Certifications, Documents) · footer (Settings + user card).
  Active item = teal gradient pill + glow. Icons from `lucide-react` (see
  `src/layouts/sidebar/menu.ts`).
- **App bar:** global search (pill), notifications, theme toggle, avatar menu.
  `backdrop-filter: blur` glass over `surface`.
- **Content:** page header (title + subtitle + primary action, wraps on mobile),
  then cards. Max container width 1400px.

---

## 6. Signature screen — My Profile (with completion)

Profile completion is **not a separate page** — it lives in the sticky summary
rail of **My Profile** (`/profile`). Keep it recognizable:
- **Conic-gradient ring** (132px) around the avatar: `conic-gradient(teal 0 →
  pct*3.6deg, divider → 360)`, inner paper circle, % pill, hover `scale(1.03)`.
- Motivational message + emoji by threshold (0 🚀 · ≤30 ✨ · ≤70 💪 · <100 🎯 · 100 🎉).
- Linear progress + "X of N sections".
- Two rail cards: **To complete** (amber rows, click → scroll to on-page section
  or navigate) and **Completed** (teal rows — the rail tracks progress in the
  brand colour; green stays reserved for semantic success). The right column holds the
  editable Personal Details and Contact Details cards (edit via `SideDrawer`).

---

## 7. Screen pattern (all profile sections)

Every section (Experience, Education, Projects, Skills, Certifications, Contact,
Personal) follows **one "manage" pattern**:

1. Page header: `<h4>` title + count/subtitle + `＋ Add` primary button.
2. Body = responsive grid of `EntityCard`s (`g2`/`g3`, collapses to 1 col on mobile).
3. Add/edit → `SideDrawer` form (react-hook-form + zod), not a new route.
4. Empty state = dashed "add" tile with a clear prompt.
5. Delete → `ConfirmDialog`.

**Admin screens** (Users, Admin About): table pattern — avatar + name, role chip,
inline progress bar, status chip, `⋯` action menu, searchbox in header.

---

## 8. Responsive rules (MUI breakpoints)

`xs 0 · sm 600 · md 900 · lg 1200 · xl 1536`

- **≥1200 desktop:** full sidebar + multi-column grids (`g3`/`g4`).
- **600–900 tablet:** sidebar collapses to icons/drawer; grids → 2 col; app bar condenses.
- **<600 mobile:** sidebar → bottom tab-bar or hamburger drawer; grids → 1 col;
  search collapses to an icon; headers stack (`flex-wrap`).
- Use MUI `sx={{ display:{ xs, sm, md } }}` and `Stack direction={{ xs:'column', md:'row' }}`.

---

## 9. Motion & effects

| Effect | Where | Value |
|---|---|---|
| Hover lift | **interactive** (clickable) cards + buttons | `translateY(-2px…-4px)` + shadow up. Static content cards do **not** lift — opt in with `data-interactive="true"` on the `Card`. |
| Focus glow | inputs, OTP | `0 0 0 4px teal-50` (light) / `rgba(0,150,138,.18)` (dark) |
| Ring fill | completion | conic-gradient by percentage |
| Page transition | routes | fade + `translateY(8px)`, `.4s` |
| Skeleton shimmer | loading | `SkeletonLoader` |
| Theme swap | root | `.4s` background/color transition |

Always gate non-essential motion behind `@media (prefers-reduced-motion: no-preference)`.

---

## 10. Implementation checklist (per new screen)

- [ ] Uses theme tokens only — no hard-coded hex in the component.
- [ ] Works in light **and** dark (`useTheme().palette.mode`, `alpha()`).
- [ ] Page header: title + subtitle + primary action; wraps on mobile.
- [ ] Grid reflows `g3 → g2 → 1col` across breakpoints.
- [ ] Add/edit uses `SideDrawer` + react-hook-form + zod; destructive uses `ConfirmDialog`.
- [ ] Loading = skeleton on first load, spinner on refresh; errors → toast.
- [ ] Icon-only buttons have `aria-label`; focus rings visible; touch targets ≥44px.
- [ ] Reuses `Input`, `Select`, `EntityCard`, `SectionCard`, `ResponsiveButton`, `ActionMenu`.
