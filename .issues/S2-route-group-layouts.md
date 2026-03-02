# [infra] Create route-group layouts (auth, public, customer, admin)

- **Labels:** `frontend`, `infrastructure`, `phase-1`
- **Milestone:** Phase 1 — Site looks alive
- **Due date:** 2026-03-13
- **Priority:** 🔴 Blocker — required for auth guards and consistent page shells

## Overview

No route-group layout files exist. Without them there are no auth guards,
no protected routes, and no consistent wrappers per section of the app.

## Acceptance Criteria

### `(auth)/layout.tsx`
- [ ] Centers the auth card (no top nav, no footer)
- [ ] Redirects to `/` if user is already authenticated

### `(public)/layout.tsx`
- [ ] Renders full `<Navbar />` + `<Footer />`
- [ ] No auth requirement

### `(customer)/layout.tsx`
- [ ] Renders full `<Navbar />` + `<Footer />`
- [ ] Redirects to `/sign-in` if user is not authenticated
- [ ] Passes current user to page context

### `(admin)/layout.tsx`
- [ ] Renders admin sidebar shell + top bar
- [ ] Redirects to `/sign-in` if user is not authenticated
- [ ] Returns 403 / redirects if user does not have admin role

## Files to create

| File | Route group |
|------|-------------|
| `frontend/app/(auth)/layout.tsx` | `/sign-in`, `/sign-up`, etc. |
| `frontend/app/(public)/layout.tsx` | `/search`, `/vehicles/[id]`, etc. |
| `frontend/app/(customer)/layout.tsx` | `/bookings`, `/account/*`, etc. |
| `frontend/app/(admin)/layout.tsx` | `/dashboard`, `/cars`, etc. |
