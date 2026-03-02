# [pages] Admin locations CRUD (`/locations`, `/locations/create`, `/locations/[id]/edit`)

- **Labels:** `frontend`, `page`, `phase-6`
- **Milestone:** Phase 6 — Admin panel
- **Due date:** 2026-05-15
- **Priority:** #34

## Overview

Full location management (pick-up / drop-off points) for the admin panel.

## Pages

### `/locations` — List
- [ ] Table: name, country, address, coordinates, status, vehicle count, actions
- [ ] Search by name, filter by country

### `/locations/create` — Create
- [ ] Fields: name, country (linked to countries), full address, lat/lng (map picker), available hours, status
- [ ] Map pin preview on lat/lng input

### `/locations/[id]/edit` — Edit
- [ ] Same form as create, pre-populated

## Files

- `frontend/app/(admin)/locations/page.tsx`
- `frontend/app/(admin)/locations/create/page.tsx`
- `frontend/app/(admin)/locations/[id]/edit/page.tsx`

## API / Data

- `GET /api/admin/locations` · `POST /api/admin/locations` · `PATCH /api/admin/locations/:id` · `DELETE /api/admin/locations/:id`
