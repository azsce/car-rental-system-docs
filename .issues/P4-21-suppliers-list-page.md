# [page] Suppliers list page (`/suppliers`)

- **Labels:** `frontend`, `page`, `phase-4`
- **Milestone:** Phase 4 — Public discovery
- **Due date:** 2026-04-10
- **Priority:** #21

## Overview

Public-facing directory of all car rental suppliers available on the platform.

## Acceptance Criteria

- [ ] **Supplier cards grid** — logo, name, star rating, number of reviews, number of vehicles, locations covered
- [ ] Search / filter: by name, by location, by rating
- [ ] Each card links to `/suppliers/[supplierId]`
- [ ] Pagination or infinite scroll
- [ ] Loading skeletons
- [ ] Empty state if no suppliers match filter
- [ ] Fully responsive

## File

`frontend/app/(public)/suppliers/page.tsx`

## API / Data

- `GET /api/suppliers?page=X&search=X&location=X` — paginated supplier list
