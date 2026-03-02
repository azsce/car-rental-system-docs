# [page] Reset password page (`/reset-password`)

- **Labels:** `frontend`, `page`, `phase-2`
- **Milestone:** Phase 2 — Core booking loop
- **Due date:** 2026-03-20
- **Priority:** #12 — completes auth recovery loop

## Overview

The reset-password page is reached via the emailed link. It allows the user to
set a new password using the token from the URL query params.

## Acceptance Criteria

- [ ] Reads `token` (and optionally `userId`) from query params
- [ ] Validates token with API on mount — shows error if expired/invalid
- [ ] New password + confirm password fields with show/hide toggles
- [ ] Password strength indicator
- [ ] Validates passwords match and meet minimum requirements
- [ ] On success: shows confirmation message and auto-redirects to `/sign-in` after 3s
- [ ] On token error: explains issue and links to `/forgot-password` to restart
- [ ] Redirect away if already authenticated
- [ ] Centered card layout (inherits `(auth)/layout.tsx`)

## File

`frontend/app/(auth)/reset-password/page.tsx`

## API / Data

- `POST /api/auth/reset-password` — `{ token, newPassword }` → `{ message }`
