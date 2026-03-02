# [pages] Admin bookings CRUD (`/bookings`, `/bookings/create`, `/bookings/[id]/edit`)

- **Labels:** `frontend`, `page`, `phase-6`
- **Milestone:** Phase 6 — Admin panel
- **Due date:** 2026-05-15
- **Priority:** #32

## Overview

Full bookings management for the admin panel.

## Pages

### `/bookings` — List
- [ ] Data table: booking ref, customer, vehicle, supplier, dates, status badge, total, actions
- [ ] Filter by status, date range, supplier, customer search
- [ ] Export to CSV button
- [ ] Pagination

### `/bookings/create` — Create
- [ ] Admin can create a booking on behalf of a customer
- [ ] Fields: customer lookup, vehicle selection, dates, location, extras, payment method override
- [ ] Price preview before confirming

### `/bookings/[id]/edit` — Edit
- [ ] Edit status (confirm, cancel, mark active/completed)
- [ ] Edit dates, locations, extras
- [ ] Add internal notes
- [ ] View payment/refund history

## Files

- `frontend/app/(admin)/bookings/page.tsx`
- `frontend/app/(admin)/bookings/create/page.tsx`
- `frontend/app/(admin)/bookings/[id]/edit/page.tsx`

## API / Data

- `GET /api/admin/bookings` · `POST /api/admin/bookings` · `PATCH /api/admin/bookings/:id`
