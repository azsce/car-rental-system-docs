# [page] Account preferences page (`/account/preferences`)

- **Labels:** `frontend`, `page`, `phase-3`
- **Milestone:** Phase 3 — Auth + Account
- **Due date:** 2026-04-03
- **Priority:** #19

## Overview

Lets users configure their app preferences: language, currency, notification settings.

## Acceptance Criteria

- [ ] **Language selector** — dropdown of supported locales, saved to profile
- [ ] **Currency selector** — dropdown, affects displayed prices site-wide
- [ ] **Notification preferences** — toggles for: booking confirmations, reminders, promotions, newsletters (email and/or push)
- [ ] Auto-save on change (or explicit Save button with toast)
- [ ] Fully responsive

## File

`frontend/app/(customer)/account/preferences/page.tsx`

## API / Data

- `GET /api/users/me/preferences` — user preferences
- `PATCH /api/users/me/preferences` — update preferences
