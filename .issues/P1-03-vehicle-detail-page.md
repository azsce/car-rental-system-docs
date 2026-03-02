# [page] Vehicle detail page (`/vehicles/[vehicleId]`)

- **Labels:** `frontend`, `page`, `phase-1`
- **Milestone:** Phase 1 — Site looks alive
- **Due date:** 2026-03-13
- **Priority:** #3 — converts search result into a booking intent

## Overview

The vehicle detail page shows full information about a specific car and provides
the primary CTA to start the checkout flow.

## Acceptance Criteria

- [ ] **Image gallery** — main image + thumbnails, lightbox on click
- [ ] **Vehicle info** — name, year, category, seats, transmission, fuel type, mileage policy
- [ ] **Price breakdown** — price/day, included extras, taxes estimate
- [ ] **Supplier info strip** — supplier name, logo, rating, link to supplier profile
- [ ] **Features / extras list** — AC, GPS, child seat, etc.
- [ ] **Availability picker** — date range selector that pre-fills checkout
- [ ] **"Book Now" CTA** — routes to `/booking/checkout/[vehicleId]?from=X&to=X`
- [ ] **Reviews section** — list of customer reviews with rating stars
- [ ] **Similar vehicles** — horizontal scroll of related cars
- [ ] Breadcrumb: Home → Search → [Vehicle name]
- [ ] Fully responsive
- [ ] `notFound()` gracefully if vehicle ID doesn't exist

## File

`frontend/app/(public)/vehicles/[vehicleId]/page.tsx`

## API / Data

- `GET /api/vehicles/:id` — full vehicle detail
- `GET /api/vehicles/:id/reviews` — reviews list
- `GET /api/vehicles?similar=:id&limit=4` — similar vehicles
