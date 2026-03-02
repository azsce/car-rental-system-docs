# [page] Admin dashboard (`/dashboard`)

- **Labels:** `frontend`, `page`, `phase-6`
- **Milestone:** Phase 6 — Admin panel
- **Due date:** 2026-05-15
- **Priority:** #30 — admin entry point

## Overview

Main admin dashboard with KPI overview and quick navigation. Requires admin role.

## Acceptance Criteria

- [ ] **KPI cards** — Total bookings, Active bookings, Revenue (this month), Total users, Total vehicles, Pending approvals
- [ ] **Bookings trend chart** — last 30 days (line/bar chart)
- [ ] **Recent bookings table** — last 10 with status badges and link to detail
- [ ] **Recent registrations** — last 5 new users
- [ ] Quick-action buttons: "Add car", "Add supplier", "Create booking"
- [ ] Date range selector for KPIs
- [ ] Fully responsive

## Files

- `frontend/app/(admin)/dashboard/page.tsx`  
  *(moved from the conflicting `(admin)/page.tsx` — see issue S3)*

## API / Data

- `GET /api/admin/stats` — KPI aggregates
- `GET /api/admin/bookings?limit=10&sort=recent` — recent bookings
