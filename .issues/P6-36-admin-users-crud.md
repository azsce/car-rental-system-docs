# [pages] Admin users CRUD (`/users`, `/users/create`, `/users/[id]`, `/users/[id]/edit`)

- **Labels:** `frontend`, `page`, `phase-6`
- **Milestone:** Phase 6 — Admin panel
- **Due date:** 2026-05-15
- **Priority:** #36

## Overview

User management for the admin panel — view, create, edit, and manage customer accounts.

## Pages

### `/users` — List
- [ ] Table: avatar, full name, email, role, join date, status, booking count, actions
- [ ] Search by name/email, filter by role and status

### `/users/create` — Create
- [ ] Fields: full name, email, password, role (customer/admin), status
- [ ] Send welcome email checkbox

### `/users/[id]` — Detail
- [ ] Full profile info + booking history tab + activity log tab
- [ ] Edit and Suspend / Delete buttons

### `/users/[id]/edit` — Edit
- [ ] Same form as create, pre-populated
- [ ] Reset password button (sends reset email)

## Files

- `frontend/app/(admin)/users/page.tsx`
- `frontend/app/(admin)/users/create/page.tsx`
- `frontend/app/(admin)/users/[id]/page.tsx`
- `frontend/app/(admin)/users/[id]/edit/page.tsx`

## API / Data

- `GET /api/admin/users` · `POST /api/admin/users` · `GET /api/admin/users/:id` · `PATCH /api/admin/users/:id` · `DELETE /api/admin/users/:id`
