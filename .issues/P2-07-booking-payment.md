# [page] Booking payment page (`/booking/payment`)

- **Labels:** `frontend`, `page`, `phase-2`
- **Milestone:** Phase 2 — Core booking loop
- **Due date:** 2026-03-20
- **Priority:** #7 — completes the payment step of the booking flow

## Overview

The payment page collects card/payment details and finalizes the booking.
Receives booking payload from checkout (via session store or query params).

## Acceptance Criteria

- [ ] **Order summary** — vehicle, dates, extras, total amount (read-only recap)
- [ ] **Payment form** — credit/debit card (Stripe Elements or equivalent)
- [ ] Billing address fields
- [ ] Promo code / voucher input with apply button
- [ ] Price updates when promo code is applied
- [ ] Submit triggers payment intent creation and confirmation
- [ ] Loading / spinner state during payment processing
- [ ] On success: redirect to `/bookings/confirmation/[bookingId]`
- [ ] On failure: inline error message (card declined, insufficient funds, etc.)
- [ ] Secure badge / SSL indicator visible
- [ ] Back link to checkout without losing form state
- [ ] Fully responsive

## File

`frontend/app/(customer)/booking/payment/page.tsx`

## API / Data

- `POST /api/bookings` — create booking + payment intent
- `POST /api/bookings/apply-promo` — validate & apply promo code
