# [page] Booking detail page (`/booking/[id]`)

- **Labels:** `frontend`, `page`, `phase-2`
- **Milestone:** Phase 2 — Core booking loop
- **Due date:** 2026-03-20
- **Priority:** #10 — single booking deep-dive for the customer

## Overview

Shows the full details of a single booking, including status timeline, documents, and actions.

## Acceptance Criteria

- [ ] Booking reference, status badge, and created date at top
- [ ] Vehicle summary card (image, name, supplier)
- [ ] Rental details: pick-up / drop-off location and date-time, extras list
- [ ] Price breakdown: base rate, extras, taxes, promo discount, total paid
- [ ] Driver details summary
- [ ] **Status timeline** — visual step indicator (Pending → Confirmed → Active → Completed)
- [ ] **Documents section** — download voucher PDF, invoice
- [ ] **Supplier contact** — phone, email, address
- [ ] Cancel button (if status allows) — confirmation modal
- [ ] Modify booking CTA (if supported)
- [ ] Back link to `/bookings`
- [ ] `notFound()` if booking doesn't belong to current user
- [ ] Fully responsive

## File

`frontend/app/(customer)/booking/[id]/page.tsx`

## API / Data

- `GET /api/bookings/:id` — full booking detail (only own bookings)
