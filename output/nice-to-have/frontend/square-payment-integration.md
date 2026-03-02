# Feature: Square Payment Integration

## Overview

Square payment gateway integration providing unified online and in-person payment processing, ideal for rental locations with physical pickup counters and point-of-sale needs.

## Sprint Category

nice-to-have

## Feature ID

F-INT-PAY-011

## User Stories

As a location staff member, I want to process payments at the counter using Square Terminal, so that I have a unified system for online and in-person payments.

As a customer, I want to pay online through Square, so that I have additional payment method options.

As a fleet manager, I want unified transaction reporting across online and counter payments, so that revenue tracking is simplified.

## Frontend Specifications

### Pages

- Checkout page with Square payment option
- Square payment form integration
- Counter payment interface for staff
- Unified transaction history

### UI Components

- Square payment button
- Square Web Payments SDK integration
- Card input form with Square styling
- Payment status indicator
- Square Terminal connection status
- Transaction receipt display

### User Flows

**Online Payment Flow**:
1. Customer selects Square payment option
2. System displays Square payment form
3. Customer enters card details
4. Square processes payment
5. System receives confirmation
6. Booking confirmed

**Counter Payment Flow**:
1. Customer arrives at pickup counter
2. Staff opens booking in system
3. Staff initiates payment on Square Terminal
4. Customer taps/inserts/swipes card
5. Square Terminal processes payment
6. System receives confirmation
7. Staff completes pickup process

### Data Requirements

- Booking amount and details
- Square location ID for counter payments
- Square customer ID for saved cards
- Transaction status from Square webhooks
- Receipt data for customer

## Backend Specifications

### API Endpoints

**POST /api/payments/square/create-payment**
- Purpose: Create Square online payment
- Authentication: Required (JWT)
- Request body: bookingId, amount, sourceId, locationId
- Response: Payment ID and status

**POST /api/payments/square/terminal-checkout**
- Purpose: Create Square Terminal checkout
- Authentication: Required (JWT, Staff role)
- Request body: bookingId, amount, deviceId
- Response: Checkout ID

**POST /api/payments/square/webhook**
- Purpose: Receive Square event notifications
- Authentication: Square signature verification
- Request body: Square event object
- Response: 200 OK

**GET /api/payments/square/locations**
- Purpose: Retrieve Square locations
- Authentication: Required (JWT, Admin role)
- Response: Array of Square locations

### Request Schemas

**CreatePaymentRequest**:
- bookingId: string (required)
- amount: decimal (required)
- sourceId: string (required) - Card nonce from Square SDK
- locationId: string (required)
- customerId: string (optional)

**TerminalCheckoutRequest**:
- bookingId: string (required)
- amount: decimal (required)
- deviceId: string (required) - Square Terminal device ID
- note: string (optional)

### Response Schemas

**PaymentResponse**:
- paymentId: string
- status: string (COMPLETED, PENDING, FAILED)
- amount: decimal
- receiptUrl: string
- cardDetails: object

**TerminalCheckoutResponse**:
- checkoutId: string
- status: string (PENDING, IN_PROGRESS, COMPLETED, CANCELED)
- deviceId: string

### Business Logic

- Integrate Square Web Payments SDK
- Support online card payments
- Integrate Square Terminal API
- Support in-person payments at counter
- Sync transactions across channels
- Unified reporting dashboard
- Handle payment failures gracefully
- Store Square customer IDs
- Support saved payment methods
- Process refunds through Square API

### Authentication Requirements

- JWT authentication for all endpoints
- Staff role for terminal checkouts
- Admin role for location management
- Webhook signature verification
- Rate limiting on payment creation

## Database Specifications

### Schema Changes

Add Square-specific tables.

### Table Definitions

**SquarePayments** (new table):
- Id: INT PRIMARY KEY AUTO_INCREMENT
- BookingId: INT NOT NULL
- PaymentId: VARCHAR(255) NOT NULL UNIQUE
- LocationId: VARCHAR(255) NOT NULL
- Amount: DECIMAL(10,2) NOT NULL
- Status: VARCHAR(50) NOT NULL
- SourceType: ENUM('online', 'terminal') NOT NULL
- DeviceId: VARCHAR(255)
- ReceiptUrl: VARCHAR(500)
- CreatedAt: DATETIME NOT NULL
- INDEX idx_booking_id (BookingId)
- INDEX idx_payment_id (PaymentId)

### Relationships

- SquarePayments → Bookings (many-to-one)

### Indexes

- UNIQUE INDEX idx_payment_id (PaymentId)
- INDEX idx_booking_id (BookingId)
- INDEX idx_location_id (LocationId)

## Technology Stack

- Backend: .NET 8+ with C#, Square .NET SDK
- Database: MySQL 8.0+
- Frontend: Next.js 14+ with TypeScript, Square Web Payments SDK

## Implementation Notes

- Install Square .NET SDK
- Configure Square application ID and access token
- Integrate Square Web Payments SDK for online
- Integrate Square Terminal API for counter
- Sync transactions across channels
- Unified reporting dashboard
- Test in Square sandbox environment
- Configure webhook endpoint
- Monitor Square API health
- Implement fallback payment options
