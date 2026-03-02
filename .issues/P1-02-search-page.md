# [page] Search / Browse cars page (`/search`)

- **Labels:** `frontend`, `page`, `phase-1`
- **Milestone:** Phase 1 — Site looks alive
- **Due date:** 2026-03-13
- **Priority:** #2 — core product feature, gate to all vehicle interactions

## Overview

The search/browse page lets users filter and view available vehicles.
It is the main entry point from the home page hero search widget.

## Acceptance Criteria

- [ ] Reads query params on load: `location`, `pickupDate`, `dropoffDate`, `category`, `priceMin`, `priceMax`
- [ ] **Filter sidebar / drawer** (collapsible on mobile):
  - [ ] Location selector
  - [ ] Date range picker (pick-up / drop-off)
  - [ ] Vehicle category (SUV, Sedan, Van, etc.)
  - [ ] Price range slider
  - [ ] Transmission (auto / manual)
  - [ ] Seats count
  - [ ] Supplier filter
- [ ] **Results grid** — vehicle cards (image, name, price/day, rating, quick CTA)
- [ ] **Sort bar** — by price, rating, relevance
- [ ] **Pagination** or infinite scroll
- [ ] Empty state when no results match filters
- [ ] Loading skeleton while fetching
- [ ] URL updates when filters change (shareable links)
- [ ] Fully responsive

## File

`frontend/app/(public)/search/page.tsx`

## API / Data

- `GET /api/vehicles?location=X&from=X&to=X&...` — paginated, filtered vehicle list
