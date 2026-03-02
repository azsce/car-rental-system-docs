# [page] Sign-in page (`/sign-in`)

- **Labels:** `frontend`, `page`, `phase-1`
- **Milestone:** Phase 1 — Site looks alive
- **Due date:** 2026-03-13
- **Priority:** #4 — required for any authenticated flow

## Overview

The sign-in page authenticates existing users. It is reached from the navbar,
from checkout (if unauthenticated), and from `(customer)/layout.tsx` redirects.

## Acceptance Criteria

- [ ] Email + password form with validation (required, valid email format)
- [ ] "Remember me" checkbox
- [ ] Show/hide password toggle
- [ ] Submit calls auth API; shows inline error on failure (invalid credentials, account locked)
- [ ] On success: redirects to `?next=` param if present, otherwise `/`
- [ ] Link to `/sign-up`
- [ ] Link to `/forgot-password`
- [ ] Social sign-in buttons (Google / Apple) — stubs acceptable if OAuth not ready
- [ ] Redirect away if already authenticated
- [ ] Fully responsive, centered card layout (inherits `(auth)/layout.tsx`)

## File

`frontend/app/(auth)/sign-in/page.tsx`

## API / Data

- `POST /api/auth/sign-in` — `{ email, password }` → `{ token, user }`
