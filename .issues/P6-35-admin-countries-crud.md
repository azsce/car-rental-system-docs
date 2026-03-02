# [pages] Admin countries CRUD (`/countries`, `/countries/create`, `/countries/[id]/edit`)

- **Labels:** `frontend`, `page`, `phase-6`
- **Milestone:** Phase 6 — Admin panel
- **Due date:** 2026-05-15
- **Priority:** #35

## Overview

Country reference data management used by locations and suppliers.

## Pages

### `/countries` — List
- [ ] Table: flag, name, ISO code, location count, actions
- [ ] Search by name or code

### `/countries/create` — Create
- [ ] Fields: name, ISO 2-letter code, flag (emoji or upload), phone prefix

### `/countries/[id]/edit` — Edit
- [ ] Same form as create, pre-populated

## Files

- `frontend/app/(admin)/countries/page.tsx`
- `frontend/app/(admin)/countries/create/page.tsx`
- `frontend/app/(admin)/countries/[id]/edit/page.tsx`

## API / Data

- `GET /api/admin/countries` · `POST /api/admin/countries` · `PATCH /api/admin/countries/:id` · `DELETE /api/admin/countries/:id`
