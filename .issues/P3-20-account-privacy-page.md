# [page] Account privacy page (`/account/privacy`)

- **Labels:** `frontend`, `page`, `phase-3`
- **Milestone:** Phase 3 — Auth + Account
- **Due date:** 2026-04-03
- **Priority:** #20

## Overview

Lets users manage data privacy controls and GDPR rights (data export, account deletion).

## Acceptance Criteria

- [ ] **Data & privacy overview** — brief explanation of what data is stored
- [ ] **Download my data** button — triggers data export request, shows confirmation
- [ ] **Delete my account** — requires password confirmation, full warning dialog, irreversible action
- [ ] Cookie preferences link → `/cookie-policy`
- [ ] Link to full privacy policy → `/privacy`
- [ ] Fully responsive

## File

`frontend/app/(customer)/account/privacy/page.tsx`

## API / Data

- `POST /api/users/me/export` — request data export (email delivery)
- `DELETE /api/users/me` — delete account (requires password re-confirmation)
