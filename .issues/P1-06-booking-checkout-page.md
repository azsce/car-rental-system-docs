# [page] Booking checkout page (`/booking/checkout/[vehicleId]`)

- **Labels:** `frontend`, `page`, `phase-1`
- **Milestone:** Phase 1 — Site looks alive
- **Due date:** 2026-03-13
- **Priority:** #6 — completes the browse → book conversion flow

## Overview

The checkout page collects driver details, rental options, and extras before
the user proceeds to payment. Requires authentication (redirected if not signed in).

## Acceptance Criteria

- [ ] Reads `vehicleId` from route + `from` / `to` date params from query string
- [ ] **Order summary sidebar** — vehicle image, name, dates, price breakdown, total
- [ ] **Driver details form** — full name, email, phone, date of birth, license number, license country
- [ ] **Rental options** — pick-up location selector, drop-off location selector (same / different)
- [ ] **Extras / add-ons** — GPS, child seat, additional driver, insurance options (with price deltas)
- [ ] **Flight info** (optional) — flight number for airport pick-ups
- [ ] **Special requests** free-text field
- [ ] Validation on all required fields before proceeding
- [ ] "Continue to Payment" button routes to `/booking/payment` with booking payload in session/store
- [ ] Loading state while fetching vehicle and price details
- [ ] Fully responsive (sidebar stacks below on mobile)

## File

`frontend/app/(customer)/booking/checkout/[vehicleId]/page.tsx`

## API / Data

- `GET /api/vehicles/:id` — vehicle + pricing
- `GET /api/locations` — for location selectors
- `POST /api/bookings/preview` — price preview with selected extras
