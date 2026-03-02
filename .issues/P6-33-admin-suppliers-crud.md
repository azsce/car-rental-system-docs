# [pages] Admin suppliers CRUD (`/suppliers`, `/suppliers/create`, `/suppliers/[id]`, `/suppliers/[id]/edit`)

- **Labels:** `frontend`, `page`, `phase-6`
- **Milestone:** Phase 6 — Admin panel
- **Due date:** 2026-05-15
- **Priority:** #33

## Overview

Full supplier management for the admin panel.

## Pages

### `/suppliers` — List
- [ ] Table: logo, name, country, vehicle count, rating, status, actions
- [ ] Search by name, filter by country and status

### `/suppliers/create` — Create
- [ ] Fields: name, logo upload, description, contact email, phone, address, bank details, commission rate, status
- [ ] On success: redirect to `/suppliers/[id]`

### `/suppliers/[id]` — Detail
- [ ] Full supplier info + vehicles tab + bookings tab
- [ ] Edit and Delete buttons

### `/suppliers/[id]/edit` — Edit
- [ ] Same form as create, pre-populated
- [ ] On success: redirect to `/suppliers/[id]`

## Files

- `frontend/app/(admin)/suppliers/page.tsx`
- `frontend/app/(admin)/suppliers/create/page.tsx`
- `frontend/app/(admin)/suppliers/[id]/page.tsx`
- `frontend/app/(admin)/suppliers/[id]/edit/page.tsx`

## API / Data

- `GET /api/admin/suppliers` · `POST /api/admin/suppliers` · `GET /api/admin/suppliers/:id` · `PATCH /api/admin/suppliers/:id` · `DELETE /api/admin/suppliers/:id`
