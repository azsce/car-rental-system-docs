# [page] Locations page (`/locations`)

- **Labels:** `frontend`, `page`, `phase-4`
- **Milestone:** Phase 4 — Public discovery
- **Due date:** 2026-04-10
- **Priority:** #23

## Overview

Public directory of all pick-up / drop-off locations. Helps users discover
where they can rent a vehicle.

## Acceptance Criteria

- [ ] **Map view** — interactive map with location pins (Leaflet / Mapbox / Google Maps)
- [ ] **List view** toggle — cards with location name, address, available vehicles count
- [ ] Search / filter by city or country
- [ ] Clicking a location or pin pre-fills the search widget and links to `/search?location=X`
- [ ] Group locations by country / region
- [ ] Loading skeletons
- [ ] Fully responsive (map collapses to top panel on mobile)

## File

`frontend/app/(public)/locations/page.tsx`

## API / Data

- `GET /api/locations` — full locations list with coordinates
