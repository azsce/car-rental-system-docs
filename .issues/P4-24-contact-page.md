# [page] Contact page (`/contact`)

- **Labels:** `frontend`, `page`, `phase-4`
- **Milestone:** Phase 4 — Public discovery
- **Due date:** 2026-04-10
- **Priority:** #24

## Overview

Provides a way for visitors and customers to get in touch with support.

## Acceptance Criteria

- [ ] **Contact form** — name, email, subject (dropdown), message textarea
- [ ] Client-side validation; server-side error display
- [ ] On success: confirmation message ("We'll get back to you within 24 hours")
- [ ] **Contact info panel** — support email, phone, business hours
- [ ] **Office locations** — address(es) with embedded map or static map image
- [ ] Link to `/faq` ("Check our FAQ first")
- [ ] Fully responsive

## File

`frontend/app/(public)/contact/page.tsx`

## API / Data

- `POST /api/contact` — `{ name, email, subject, message }` → `{ message }`
