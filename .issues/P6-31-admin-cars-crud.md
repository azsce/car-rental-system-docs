# [pages] Admin cars CRUD (`/cars`, `/cars/create`, `/cars/[id]`, `/cars/[id]/edit`)

- **Labels:** `frontend`, `page`, `phase-6`
- **Milestone:** Phase 6 — Admin panel
- **Due date:** 2026-05-15
- **Priority:** #31

## Overview

Full CRUD management for vehicles in the admin panel.

## Pages

### `/cars` — List
- [ ] Data table: image thumbnail, name, supplier, category, price/day, status, actions
- [ ] Search by name; filter by supplier, category, status
- [ ] Bulk actions: activate/deactivate, delete
- [ ] Pagination
- [ ] Link to create + edit per row

### `/cars/create` — Create
- [ ] Form: name, description, category, supplier, year, seats, transmission, fuel, mileage policy, price/day, extras, images (multi-upload), status toggle
- [ ] Validation on all required fields
- [ ] On success: redirect to `/cars` with success toast

### `/cars/[id]` — Detail
- [ ] Read-only view of all vehicle fields + booking history for this car
- [ ] Edit and Delete buttons

### `/cars/[id]/edit` — Edit
- [ ] Same form as create, pre-populated with existing data
- [ ] On success: redirect to `/cars/[id]` with success toast

## Files

- `frontend/app/(admin)/cars/page.tsx`
- `frontend/app/(admin)/cars/create/page.tsx`
- `frontend/app/(admin)/cars/[id]/page.tsx`
- `frontend/app/(admin)/cars/[id]/edit/page.tsx`

## API / Data

- `GET /api/admin/vehicles` · `POST /api/admin/vehicles` · `GET /api/admin/vehicles/:id` · `PATCH /api/admin/vehicles/:id` · `DELETE /api/admin/vehicles/:id`
