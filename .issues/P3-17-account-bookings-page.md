# [page] Account bookings page (`/account/bookings`)

- **Labels:** `frontend`, `page`, `phase-3`
- **Milestone:** Phase 3 — Auth + Account
- **Due date:** 2026-04-03
- **Priority:** #17

## Overview

An account-area view of the user's booking history (mirrors `/bookings` but
within the account section layout with the account nav sidebar).

## Acceptance Criteria

- [ ] Same data and behaviour as `/bookings` (status tabs, cards, pagination)
- [ ] Rendered within the account layout (account nav sidebar visible)
- [ ] Consider extracting the bookings list into a shared `<BookingsList />` component
  reused by both `/bookings` and this page, rather than duplicating logic
- [ ] Fully responsive

## File

`frontend/app/(customer)/account/bookings/page.tsx`

## Notes

Coordinate with the `/bookings` page issue to avoid logic duplication.
