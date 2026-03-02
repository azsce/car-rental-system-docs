# [page] Booking confirmation page (`/bookings/confirmation/[bookingId]`)

- **Labels:** `frontend`, `page`, `phase-2`
- **Milestone:** Phase 2 — Core booking loop
- **Due date:** 2026-03-20
- **Priority:** #8 — post-payment success screen

## Overview

The confirmation page is shown after a successful payment. It confirms the
booking details and provides next steps for the customer.

## Acceptance Criteria

- [ ] Large success indicator (checkmark / animation)
- [ ] Booking reference / ID prominently displayed
- [ ] Full booking summary: vehicle, pick-up/drop-off location, dates, total paid
- [ ] Supplier contact information
- [ ] "Add to calendar" button (iCal / Google Calendar)
- [ ] Download / print booking voucher (PDF link or print view)
- [ ] CTA: "View my bookings" → `/bookings`
- [ ] Email confirmation notice ("A confirmation has been sent to your email")
- [ ] Handles invalid/missing `bookingId` gracefully with redirect to `/bookings`
- [ ] Fully responsive

## File

`frontend/app/(public)/bookings/confirmation/[bookingId]/page.tsx`

## API / Data

- `GET /api/bookings/:id` — full booking details for confirmation display
