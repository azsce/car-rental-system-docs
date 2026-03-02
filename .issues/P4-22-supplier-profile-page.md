# [page] Supplier profile page (`/suppliers/[supplierId]`)

- **Labels:** `frontend`, `page`, `phase-4`
- **Milestone:** Phase 4 — Public discovery
- **Due date:** 2026-04-10
- **Priority:** #22

## Overview

Public profile for a single supplier — their vehicles, locations, and reviews.

## Acceptance Criteria

- [ ] **Header** — supplier logo, name, location(s), rating, number of reviews, years active
- [ ] **About section** — description, contact details, opening hours
- [ ] **Vehicles tab** — grid of available vehicles from this supplier (links to vehicle detail)
- [ ] **Locations tab** — map + list of pick-up/drop-off points
- [ ] **Reviews tab** — paginated customer review list with rating breakdown
- [ ] Breadcrumb: Home → Suppliers → [Supplier name]
- [ ] `notFound()` if supplier ID doesn't exist
- [ ] Fully responsive

## File

`frontend/app/(public)/suppliers/[supplierId]/page.tsx`

## API / Data

- `GET /api/suppliers/:id` — supplier detail
- `GET /api/suppliers/:id/vehicles` — supplier's vehicles
- `GET /api/suppliers/:id/reviews` — supplier reviews
