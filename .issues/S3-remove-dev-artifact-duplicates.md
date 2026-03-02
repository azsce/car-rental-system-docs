# [infra] Remove dev-artifact duplicate route folders & fix route conflict

- **Labels:** `frontend`, `infrastructure`, `phase-1`
- **Milestone:** Phase 1 — Site looks alive
- **Due date:** 2026-03-13
- **Priority:** 🟠 High — will cause build failures if left in

## Overview

Three structural problems exist that must be cleaned up before any serious work:

1. **Space-in-name duplicate folders** — Next.js will fail to resolve routes with spaces.
2. **Admin page conflicts with root `/`** — `(admin)/page.tsx` resolves to `/` because
   route groups don't add path segments, clashing with `app/page.tsx`.

## Tasks

- [ ] Delete `frontend/app/(public)/search copy/` (entire directory)
- [ ] Delete `frontend/app/(public)/suppliers copy/` (entire directory)
- [ ] Move `frontend/app/(admin)/page.tsx` → `frontend/app/(admin)/dashboard/page.tsx`
  - Update any links that point to the admin root accordingly

## Files affected

| Action | Path |
|--------|------|
| DELETE | `frontend/app/(public)/search copy/page.tsx` |
| DELETE | `frontend/app/(public)/suppliers copy/page.tsx` |
| RENAME | `frontend/app/(admin)/page.tsx` → `(admin)/dashboard/page.tsx` |
