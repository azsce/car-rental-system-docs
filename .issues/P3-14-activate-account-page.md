# [page] Activate account page (`/activate/[userId]/[token]`)

- **Labels:** `frontend`, `page`, `phase-3`
- **Milestone:** Phase 3 — Auth + Account
- **Due date:** 2026-04-03
- **Priority:** #14

## Overview

The email verification link lands here. Activates the user account using
`userId` and `token` route params.

## Acceptance Criteria

- [ ] On mount: call activation API with `userId` + `token` from URL params
- [ ] Show loading spinner while API call is in flight
- [ ] On success: display success message + auto-redirect to `/sign-in` after 3s (or immediately if already signed in → redirect to `/`)
- [ ] On failure (expired/invalid token): clear error with link to `/verify-email` to request a new link
- [ ] No interactive form — purely an auto-action page
- [ ] Centered card layout (inherits `(auth)/layout.tsx`)

## File

`frontend/app/(auth)/activate/[userId]/[token]/page.tsx`

## API / Data

- `GET /api/auth/activate?userId=X&token=X` — activates the account
