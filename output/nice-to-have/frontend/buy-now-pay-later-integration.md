# Feature: Buy Now Pay Later (BNPL) Integration

## Overview

BNPL integration with services like Klarna, Affirm, or Afterpay enabling customers to split rental payments into installments, reducing upfront cost barriers and increasing booking values.

## Sprint Category

nice-to-have

## Feature ID

F-INT-PAY-017

## User Stories

As a budget-conscious customer, I want to split my rental payment into installments, so that I can afford premium vehicles without upfront cost barriers.

As a platform operator, I want to offer BNPL, so that average booking value increases and conversion rates improve.

As a customer, I want instant BNPL approval, so that checkout is fast and seamless.

## Frontend Specifications

### Pages

- Checkout page with BNPL option
- BNPL payment plan selector
- BNPL approval flow
- Payment schedule display

### UI Components

- BNPL provider button (Klarna, Affirm)
- Payment plan selector (4 installments, 6 installments, etc.)
- Soft credit check indicator
- Approval status display
- Payment schedule timeline
- BNPL terms and conditions

### User Flows

1. Customer proceeds to checkout with booking >$300
2. System displays BNPL option
3. Customer selects BNPL
4. System initiates soft credit check (<3 seconds)
5. BNPL provider displays payment plan options
6. Customer selects plan
7. Customer approves BNPL terms
8. Platform receives full payment from BNPL provider
9. Booking confirmed
10. BNPL provider collects from customer over time

### Data Requirements

- Booking amount
- Customer information for credit check
- BNPL provider approval status
- Payment plan details
- BNPL fees and total cost

## Backend Specifications

### API Endpoints

**POST /api/payments/bnpl/check-eligibility**
- Purpose: Check BNPL eligibility
- Authentication: Required (JWT)
- Request body: amount, customerId
- Response: Eligible, max amount, providers

**POST /api/payments/bnpl/create-session**
- Purpose: Create BNPL checkout session
- Authentication: Required (JWT)
- Request body: bookingId, amount, provider
- Response: Session ID, redirect URL

**POST /api/payments/bnpl/webhook**
- Purpose: Receive BNPL status updates
- Authentication: Provider webhook signature
- Request body: BNPL event
- Response: 200 OK

### Request Schemas

**CheckEligibilityRequest**:
- amount: decimal (required)
- customerId: string (required)
- currency: string (required)

**CreateBNPLSessionRequest**:
- bookingId: string (required)
- amount: decimal (required)
- provider: string (required) - klarna, affirm, afterpay
- currency: string (required)

### Response Schemas

**EligibilityResponse**:
- eligible: boolean
- maxAmount: decimal
- providers: array of available providers
- estimatedInstallment: decimal

**BNPLSessionResponse**:
- sessionId: string
- redirectUrl: string
- expiresAt: datetime

### Business Logic

- Check booking amount threshold ($300+)
- Perform soft credit check
- Display payment plan options
- Platform receives full payment upfront
- BNPL provider handles collection
- Track BNPL conversion rates
- Monitor average order value impact

### Authentication Requirements

- JWT authentication required
- Webhook signature verification
- Rate limiting on BNPL requests

## Database Specifications

### Schema Changes

Add BNPL tracking table.

### Table Definitions

**BNPLPayments** (new table):
- Id: INT PRIMARY KEY AUTO_INCREMENT
- BookingId: INT NOT NULL
- Provider: ENUM('klarna', 'affirm', 'afterpay') NOT NULL
- SessionId: VARCHAR(255) NOT NULL UNIQUE
- Amount: DECIMAL(10,2) NOT NULL
- InstallmentCount: INT NOT NULL
- InstallmentAmount: DECIMAL(10,2) NOT NULL
- Status: VARCHAR(50) NOT NULL
- ApprovedAt: DATETIME
- CreatedAt: DATETIME NOT NULL
- INDEX idx_booking_id (BookingId)

### Relationships

- BNPLPayments → Bookings (many-to-one)

### Indexes

- UNIQUE INDEX idx_session_id (SessionId)
- INDEX idx_booking_id (BookingId)

## Technology Stack

- Backend: .NET 8+ with C#
- Database: MySQL 8.0+
- Frontend: Next.js 14+ with TypeScript

## Implementation Notes

- Integrate BNPL provider SDK
- Display BNPL for bookings >$300
- Perform soft credit check (<3 seconds)
- Display payment plan options
- Platform receives full payment upfront
- BNPL handles customer collection
- Track conversion rates
- Monitor AOV impact
- Test in provider sandbox
