# [page] Account profile page (`/account/profile`)

- **Labels:** `frontend`, `page`, `phase-3`
- **Milestone:** Phase 3 — Auth + Account
- **Due date:** 2026-04-03
- **Priority:** #15

## Overview

Allows the authenticated user to view and edit their personal profile information.

## Acceptance Criteria

- [ ] **Account nav** — sidebar or tab bar linking to profile / security / privacy / preferences / bookings / payments
- [ ] **Avatar upload** — click to upload, preview, save
- [ ] Editable fields: Full name, Phone number, Date of birth, Address
- [ ] Driver license section: license number, issuing country, expiry date
- [ ] Save button with loading state + success / error toast
- [ ] Field-level validation
- [ ] Fully responsive

## File

`frontend/app/(customer)/account/profile/page.tsx`

## API / Data

- `GET /api/users/me` — current user profile
- `PATCH /api/users/me` — update profile fields
- `POST /api/users/me/avatar` — upload avatar
