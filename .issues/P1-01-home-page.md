# [page] Home page (`/`)

- **Labels:** `frontend`, `page`, `phase-1`
- **Milestone:** Phase 1 — Site looks alive
- **Due date:** 2026-03-13
- **Priority:** #1 — first thing a visitor sees

## Overview

Replace the `create-next-app` boilerplate root page with the real landing page.
This is the single most visible page; it drives first impressions and search/browse CTAs.

## Acceptance Criteria

- [ ] **Hero section** — headline, sub-headline, search widget (pick-up location, dates, drop-off)
- [ ] **Search widget** submits to `/search` with query params pre-filled
- [ ] **Featured vehicles section** — grid of top-rated/available cars (fetched from API)
- [ ] **How it works** — 3-step explainer section (static content)
- [ ] **Popular locations** — clickable location cards linking to `/search?location=X`
- [ ] **Supplier logos / trust strip** (static or from API)
- [ ] Fully responsive (mobile, tablet, desktop)
- [ ] Passes Lighthouse accessibility score ≥ 90

## File

`frontend/app/page.tsx`

## API / Data

- `GET /api/vehicles?featured=true&limit=6` — featured vehicles
- `GET /api/locations?popular=true` — popular locations

## Design notes

- Hero background: full-width image or video with dark overlay
- Search widget should be sticky or prominent above the fold
