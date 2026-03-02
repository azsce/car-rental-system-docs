# [page] Account payments page (`/account/payments`)

- **Labels:** `frontend`, `page`, `phase-3`
- **Milestone:** Phase 3 — Auth + Account
- **Due date:** 2026-04-03
- **Priority:** #18

## Overview

Shows the customer's saved payment methods and transaction history.

## Acceptance Criteria

- [ ] **Saved payment methods** list — card brand icon, last 4 digits, expiry, default badge
- [ ] Add new card button (Stripe Elements modal or inline form)
- [ ] Remove card button per method (with confirmation)
- [ ] Set as default button
- [ ] **Transaction history** table — date, booking ref, amount, status (paid/refunded)
- [ ] Download invoice link per transaction
- [ ] Empty states for both sections
- [ ] Fully responsive

## File

`frontend/app/(customer)/account/payments/page.tsx`

## API / Data

- `GET /api/users/me/payment-methods` — saved cards
- `POST /api/users/me/payment-methods` — add card
- `DELETE /api/users/me/payment-methods/:id` — remove card
- `GET /api/users/me/transactions` — transaction history
