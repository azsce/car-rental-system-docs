# [page] Sign-up page (`/sign-up`)

- **Labels:** `frontend`, `page`, `phase-1`
- **Milestone:** Phase 1 — Site looks alive
- **Due date:** 2026-03-13
- **Priority:** #5 — new user onboarding

## Overview

The sign-up page registers new customers. After successful registration
the user should receive a verification email and be shown the verify-email prompt.

## Acceptance Criteria

- [ ] Fields: Full name, Email, Password, Confirm Password
- [ ] Password strength indicator
- [ ] Show/hide password toggle on both password fields
- [ ] Client-side validation: required fields, email format, password match, min length 8
- [ ] Terms of Service + Privacy Policy checkbox (required) with links to `/tos` and `/privacy`
- [ ] Submit calls auth API; shows inline field errors from server response
- [ ] On success: redirects to `/verify-email` with email hint in query param
- [ ] Link to `/sign-in` for existing users
- [ ] Social sign-up buttons (Google / Apple) — stubs acceptable if OAuth not ready
- [ ] Redirect away if already authenticated
- [ ] Fully responsive, centered card layout (inherits `(auth)/layout.tsx`)

## File

`frontend/app/(auth)/sign-up/page.tsx`

## API / Data

- `POST /api/auth/sign-up` — `{ fullName, email, password }` → `{ message }`
