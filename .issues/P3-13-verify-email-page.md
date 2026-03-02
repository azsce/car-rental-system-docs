# [page] Verify email page (`/verify-email`)

- **Labels:** `frontend`, `page`, `phase-3`
- **Milestone:** Phase 3 — Auth + Account
- **Due date:** 2026-04-03
- **Priority:** #13

## Overview

Shown immediately after sign-up. Prompts the user to check their inbox and verify their email address.

## Acceptance Criteria

- [ ] Reads `email` hint from query param to display "We sent an email to **user@example.com**"
- [ ] Resend verification email button (with cooldown timer after each send)
- [ ] "Wrong email?" link back to `/sign-up`
- [ ] Link to `/sign-in` for users who already verified by another device
- [ ] Centered card layout (inherits `(auth)/layout.tsx`)

## File

`frontend/app/(auth)/verify-email/page.tsx`

## API / Data

- `POST /api/auth/resend-verification` — `{ email }` → `{ message }`
