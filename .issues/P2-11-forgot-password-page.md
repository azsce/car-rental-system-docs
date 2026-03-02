# [page] Forgot password page (`/forgot-password`)

- **Labels:** `frontend`, `page`, `phase-2`
- **Milestone:** Phase 2 — Core booking loop
- **Due date:** 2026-03-20
- **Priority:** #11 — essential auth recovery

## Overview

Allows users to request a password-reset link via their registered email.

## Acceptance Criteria

- [ ] Single email input with validation
- [ ] Submit sends reset-link request to API
- [ ] Success state: friendly message ("Check your email") regardless of whether email exists (prevent enumeration)
- [ ] Link back to `/sign-in`
- [ ] Rate-limit feedback (if too many requests, show "please wait X minutes")
- [ ] Redirect away if already authenticated
- [ ] Centered card layout (inherits `(auth)/layout.tsx`)

## File

`frontend/app/(auth)/forgot-password/page.tsx`

## API / Data

- `POST /api/auth/forgot-password` — `{ email }` → `{ message }`
