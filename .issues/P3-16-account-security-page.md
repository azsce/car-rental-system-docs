# [page] Account security page (`/account/security`)

- **Labels:** `frontend`, `page`, `phase-3`
- **Milestone:** Phase 3 — Auth + Account
- **Due date:** 2026-04-03
- **Priority:** #16

## Overview

Lets users manage their account security settings: password, 2FA, active sessions.

## Acceptance Criteria

- [ ] **Change password** section: current password, new password, confirm new password, show/hide toggles, strength meter, save button
- [ ] **Two-factor authentication** toggle (enable / disable) with setup instructions
- [ ] **Active sessions** list — device, location, last active — with "Revoke" button per session
- [ ] "Sign out all other sessions" button
- [ ] Success/error toast on each action
- [ ] Fully responsive

## File

`frontend/app/(customer)/account/security/page.tsx`

## API / Data

- `POST /api/auth/change-password` — `{ currentPassword, newPassword }`
- `GET /api/auth/sessions` — list active sessions
- `DELETE /api/auth/sessions/:id` — revoke session
