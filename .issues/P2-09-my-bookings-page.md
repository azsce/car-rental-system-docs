# [page] My bookings page (`/bookings`)

- **Labels:** `frontend`, `page`, `phase-2`
- **Milestone:** Phase 2 — Core booking loop
- **Due date:** 2026-03-20
- **Priority:** #9 — customer self-service view of all bookings

## Overview

Lists all bookings for the authenticated customer with status badges and quick actions.

## Acceptance Criteria

- [ ] **Tabs / filter bar** — All, Upcoming, Active, Completed, Cancelled
- [ ] **Booking card** per booking: vehicle image, name, dates, reference ID, status badge, total
- [ ] Status badges: Pending, Confirmed, Active, Completed, Cancelled (color-coded)
- [ ] CTA on each card: "View details" → `/booking/[id]`
- [ ] Cancel button for eligible bookings (with confirmation dialog)
- [ ] Empty state per tab with CTA to `/search`
- [ ] Pagination or infinite scroll
- [ ] Loading skeletons
- [ ] Fully responsive

## File

`frontend/app/(customer)/bookings/page.tsx`

## API / Data

- `GET /api/bookings?customerId=me&status=X&page=X` — paginated booking list
- `DELETE /api/bookings/:id` — cancel booking
