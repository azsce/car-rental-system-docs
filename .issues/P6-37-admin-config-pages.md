# [pages] Admin config pages (pricing, scheduler, bank details, settings, notifications)

- **Labels:** `frontend`, `page`, `phase-6`
- **Milestone:** Phase 6 — Admin panel
- **Due date:** 2026-05-15
- **Priority:** #37

## Overview

Admin configuration and operational pages bundled together due to similar
form-heavy, settings-style structure.

## Pages

### `/pricing` — Pricing rules
- [ ] Global price multipliers by category, season, location
- [ ] Discount tiers and promotional rates
- [ ] Save with preview of effect

### `/scheduler` — Booking / maintenance scheduler
- [ ] Calendar view of upcoming bookings across all vehicles
- [ ] Mark vehicles as under maintenance (blocks them from search)
- [ ] Filter by supplier or vehicle

### `/bank-details` — Payout bank details
- [ ] Form: bank name, IBAN/account number, SWIFT/BIC, account holder name
- [ ] Per-supplier bank info management

### `/settings` — Global site settings
- [ ] Site name, logo, contact email, support phone
- [ ] Default currency, default language
- [ ] Feature toggles (enable/disable sign-ups, maintenance mode)

### `/notifications` — Notification templates
- [ ] List of notification types (booking confirmed, reminder, cancellation, etc.)
- [ ] Edit email subject + body per type (rich text editor)
- [ ] Send test notification button

## Files

- `frontend/app/(admin)/pricing/page.tsx`
- `frontend/app/(admin)/scheduler/page.tsx`
- `frontend/app/(admin)/bank-details/page.tsx`
- `frontend/app/(admin)/settings/page.tsx`
- `frontend/app/(admin)/notifications/page.tsx`
