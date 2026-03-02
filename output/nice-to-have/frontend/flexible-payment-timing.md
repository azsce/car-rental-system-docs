# Feature: Flexible Payment Timing Options

## Overview

Multiple payment timing options to accommodate different customer needs and risk profiles. Supports pay in full at booking, pay deposit with balance at pickup, pay at counter with pre-authorization, split payments over time via BNPL, and corporate post-rental invoicing. Includes automated deposit handling, pre-authorization holds, balance collection reminders, and secure payment method storage for deferred payments.

## Sprint Category

nice-to-have (Nice-to-have - Would be great but not essential)

## Feature ID

F-PB-005

## User Stories

### As a budget-conscious customer
I want to pay a deposit now and the balance later, so that I can spread the cost and manage my cash flow better.

### As a business traveler
I want to reserve without immediate payment and pay at the counter, so that I can use my corporate card at pickup for easier expense reporting.

### As a customer with limited funds
I want to split my payment over time, so that I can afford a rental that would otherwise be out of reach.

### As a corporate account holder
I want post-rental invoicing, so that my company is billed directly without requiring personal payment.

## Frontend Specifications

### Pages

**Payment Timing Selection Page** (`/booking/payment-timing`)
- Display available payment timing options
- Show deposit amount and balance due for deposit option
- Display pre-authorization amount for pay at counter
- Show split payment schedule for BNPL
- Highlight recommended option based on booking value
- Display terms and conditions for each option

**Balance Due Page** (`/booking/balance-due/{bookingId}`)
- Display outstanding balance amount
- Show original deposit paid
- Display due date for balance payment
- Provide payment method selection
- Show consequences of non-payment
- Enable balance payment processing

### UI Components

**PaymentTimingSelector Component**
- Radio button selection for timing options
- Visual cards showing each option with details
- Deposit calculator showing split amounts
- Pre-authorization amount display
- Payment schedule preview for BNPL
- Conditional rendering based on booking value and user eligibility

**DepositCalculator Component**
- Deposit percentage slider (20%, 30%, 50%)
- Real-time calculation of deposit and balance amounts
- Due date display for balance payment
- Automatic reminder schedule display
- Terms and conditions for deposit bookings

**PreAuthorizationInfo Component**
- Pre-authorization amount breakdown (rental + security deposit)
- Hold duration explanation
- Release timeline information
- Required card type information
- Visual representation of hold vs charge

**BalanceReminderCard Component**
- Outstanding balance amount display
- Days until due date countdown
- Quick pay button
- Payment method on file display
- Automatic charge opt-in toggle

### User Flows

**Pay Deposit Flow**:
1. User selects "Pay Deposit" option
2. System displays deposit percentage options (20%, 30%, 50%)
3. User selects deposit percentage
4. System calculates deposit and balance amounts
5. User proceeds to payment method selection
6. System processes deposit payment
7. System schedules balance due date (typically 24-48 hours before pickup)
8. System sends confirmation with balance due information
9. System sends reminder notifications as due date approaches
10. User pays balance through email link or account dashboard
11. System confirms full payment and booking readiness

**Pay at Counter Flow**:
1. User selects "Pay at Counter" option
2. System displays pre-authorization requirements
3. User provides credit card for pre-authorization
4. System validates card and places hold
5. System confirms booking with "Payment Due at Pickup" status
6. User receives confirmation with pickup payment instructions
7. At pickup, user pays full amount
8. System releases pre-authorization hold within 3-7 days
9. System updates booking to "Paid" status

**Corporate Billing Flow**:
1. User selects "Corporate Billing" option
2. System verifies corporate account association
3. User selects cost center or project code
4. System checks credit limit availability
5. System creates booking with "Corporate Invoice" status
6. User completes rental
7. System generates invoice post-rental
8. System sends invoice to corporate billing contact
9. Corporate account pays via ACH/wire transfer
10. System marks booking as paid

### Data Requirements

**From Backend APIs**:
- GET `/api/payment-timing/options` - Available timing options for booking
- POST `/api/payments/deposit` - Process deposit payment
- GET `/api/payments/balance/{bookingId}` - Get outstanding balance
- POST `/api/payments/balance/{bookingId}` - Pay outstanding balance
- POST `/api/payments/pre-authorize` - Place pre-authorization hold
- POST `/api/payments/capture` - Capture pre-authorized amount
- POST `/api/payments/release` - Release pre-authorization
- GET `/api/corporate/credit-limit` - Check corporate credit availability

**Payment Timing Data**:
- Available timing options for booking
- Deposit percentage options
- Balance due date
- Pre-authorization amount
- Corporate credit limit
- Payment schedule for BNPL

## Backend Specifications

### API Endpoints

**GET `/api/v1/payment-timing/options`**
- Purpose: Get available payment timing options for booking
- Authentication: Required (JWT)
- Query Parameters:
  - `bookingAmount` (decimal, required): Total booking amount
  - `userId` (guid, optional): User ID for eligibility check
- Response: Array of available timing options with details

**POST `/api/v1/payments/deposit`**
- Purpose: Process deposit payment
- Authentication: Required (JWT)
- Request Body:
  - `bookingId` (guid, required): Associated booking
  - `depositPercentage` (int, required): 20, 30, or 50
  - `paymentMethodId` (guid, required): Payment method to use
- Response: Transaction result with balance due information

**GET `/api/v1/payments/balance/{bookingId}`**
- Purpose: Get outstanding balance for booking
- Authentication: Required (JWT)
- Authorization: User must own booking
- Path Parameters:
  - `bookingId` (guid, required): Booking ID
- Response: Balance details with due date

**POST `/api/v1/payments/balance/{bookingId}`**
- Purpose: Pay outstanding balance
- Authentication: Required (JWT)
- Authorization: User must own booking
- Path Parameters:
  - `bookingId` (guid, required): Booking ID
- Request Body:
  - `paymentMethodId` (guid, required): Payment method to use
- Response: Transaction result

**POST `/api/v1/payments/pre-authorize`**
- Purpose: Place pre-authorization hold on payment method
- Authentication: Required (JWT)
- Request Body:
  - `bookingId` (guid, required): Associated booking
  - `paymentMethodId` (guid, required): Payment method to authorize
  - `amount` (decimal, required): Hold amount
- Response: Authorization details with hold reference

**POST `/api/v1/payments/capture/{authorizationId}`**
- Purpose: Capture pre-authorized payment
- Authentication: Required (JWT)
- Authorization: Supplier or Admin role
- Path Parameters:
  - `authorizationId` (guid, required): Authorization ID
- Request Body:
  - `amount` (decimal, required): Amount to capture
- Response: Transaction result

**POST `/api/v1/payments/release/{authorizationId}`**
- Purpose: Release pre-authorization hold
- Authentication: Required (JWT)
- Authorization: Supplier or Admin role
- Path Parameters:
  - `authorizationId` (guid, required): Authorization ID
- Response: Success confirmation

**GET `/api/v1/corporate/credit-limit`**
- Purpose: Check available corporate credit
- Authentication: Required (JWT)
- Authorization: Corporate account member
- Response: Credit limit and available balance

### Request Schemas

**ProcessDepositRequest**:
```
{
  bookingId: guid,
  depositPercentage: 20 | 30 | 50,
  paymentMethodId: guid,
  savePaymentMethod: boolean
}
```

**PreAuthorizeRequest**:
```
{
  bookingId: guid,
  paymentMethodId: guid,
  amount: decimal,
  holdDuration: int (days, default 7)
}
```

### Response Schemas

**PaymentTimingOptionsResponse**:
```
{
  options: [
    {
      type: "full" | "deposit" | "counter" | "bnpl" | "corporate",
      available: boolean,
      depositPercentages: [20, 30, 50] (for deposit option),
      preAuthAmount: decimal (for counter option),
      eligibilityReason: string (if not available)
    }
  ]
}
```

**BalanceDetailsResponse**:
```
{
  bookingId: guid,
  totalAmount: decimal,
  depositPaid: decimal,
  balanceDue: decimal,
  dueDate: datetime,
  currency: string,
  paymentMethodOnFile: object,
  autoChargeEnabled: boolean
}
```

### Business Logic

**Deposit Payment Logic**:
- Calculate deposit amount based on percentage
- Process deposit payment immediately
- Calculate balance due amount
- Set balance due date (24-48 hours before pickup)
- Store payment method for balance collection
- Schedule reminder notifications (7 days, 3 days, 1 day before due)
- Enable auto-charge option for balance
- Handle balance payment failures with retry logic

**Pre-Authorization Logic**:
- Calculate hold amount (rental cost + security deposit + buffer)
- Validate payment method supports pre-authorization
- Place authorization hold through payment gateway
- Set hold expiration (7-30 days based on booking date)
- Monitor hold status and renew if needed
- Release hold after successful payment at counter
- Capture hold if customer no-shows (per policy)

**Corporate Billing Logic**:
- Verify user is associated with corporate account
- Check corporate credit limit availability
- Reserve credit limit for booking amount
- Create booking with "Corporate Invoice" status
- Generate invoice after rental completion
- Send invoice to corporate billing contact
- Track payment status and send reminders
- Apply late payment fees per corporate agreement

**Balance Collection**:
- Send reminder notifications at scheduled intervals
- Attempt automatic charge if enabled
- Handle payment failures with retry logic (3 attempts)
- Escalate to manual collection if auto-charge fails
- Cancel booking if balance not paid by due date (per policy)
- Refund deposit if booking cancelled due to non-payment

### Authentication Requirements

- JWT token required for all payment timing endpoints
- User must own booking for balance payment
- Supplier or Admin role required for capture/release operations
- Corporate account association required for corporate billing
- Payment method must belong to user

## Database Specifications

### Schema Changes

**Modifications to Existing Tables**:
- Add `PaymentTiming` column to `Bookings` table
- Add `DepositPercentage` column to `Bookings` table
- Add `BalanceDueDate` column to `Bookings` table
- Add `AutoChargeBalance` column to `Bookings` table

**New Tables**:
- `DepositPayments` - Deposit transaction tracking
- `BalancePayments` - Balance payment tracking
- `CorporateInvoices` - Corporate billing invoices

### Table Definitions

**Bookings Table Modifications**:
```sql
ALTER TABLE Bookings
ADD COLUMN PaymentTiming ENUM('full', 'deposit', 'counter', 'bnpl', 'corporate') NOT NULL DEFAULT 'full',
ADD COLUMN DepositPercentage INT NULL COMMENT '20, 30, or 50',
ADD COLUMN DepositAmount DECIMAL(10,2) NULL,
ADD COLUMN BalanceDue DECIMAL(10,2) NULL,
ADD COLUMN BalanceDueDate DATETIME NULL,
ADD COLUMN BalancePaidAt DATETIME NULL,
ADD COLUMN AutoChargeBalance BOOLEAN DEFAULT FALSE,
ADD INDEX idx_balance_due (BalanceDueDate, BalanceDue);
```

**DepositPayments Table**:
```sql
CREATE TABLE DepositPayments (
  DepositPaymentId CHAR(36) PRIMARY KEY,
  BookingId CHAR(36) NOT NULL,
  TransactionId CHAR(36) NOT NULL,
  DepositPercentage INT NOT NULL,
  DepositAmount DECIMAL(10,2) NOT NULL,
  BalanceDue DECIMAL(10,2) NOT NULL,
  BalanceDueDate DATETIME NOT NULL,
  BalancePaidAt DATETIME NULL,
  BalanceTransactionId CHAR(36) NULL,
  RemindersSent INT DEFAULT 0,
  LastReminderAt DATETIME NULL,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId) ON DELETE RESTRICT,
  FOREIGN KEY (TransactionId) REFERENCES PaymentTransactions(TransactionId) ON DELETE RESTRICT,
  FOREIGN KEY (BalanceTransactionId) REFERENCES PaymentTransactions(TransactionId) ON DELETE SET NULL,
  
  INDEX idx_booking_id (BookingId),
  INDEX idx_balance_due (BalanceDueDate, BalancePaidAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**CorporateInvoices Table**:
```sql
CREATE TABLE CorporateInvoices (
  InvoiceId CHAR(36) PRIMARY KEY,
  BookingId CHAR(36) NOT NULL,
  CorporateAccountId CHAR(36) NOT NULL,
  InvoiceNumber VARCHAR(50) NOT NULL,
  Amount DECIMAL(10,2) NOT NULL,
  Currency CHAR(3) NOT NULL,
  IssueDate DATE NOT NULL,
  DueDate DATE NOT NULL,
  PaidDate DATE NULL,
  Status ENUM('draft', 'issued', 'sent', 'overdue', 'paid', 'cancelled') NOT NULL,
  CostCenter VARCHAR(100) NULL,
  ProjectCode VARCHAR(100) NULL,
  BillingContactEmail VARCHAR(255) NOT NULL,
  PaymentMethod VARCHAR(50) NULL COMMENT 'ACH, wire, check',
  Notes TEXT NULL,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId) ON DELETE RESTRICT,
  FOREIGN KEY (CorporateAccountId) REFERENCES CorporateAccounts(CorporateAccountId) ON DELETE RESTRICT,
  
  INDEX idx_corporate_account (CorporateAccountId, IssueDate DESC),
  INDEX idx_status (Status, DueDate),
  INDEX idx_invoice_number (InvoiceNumber),
  UNIQUE KEY uk_booking_invoice (BookingId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Relationships

- `DepositPayments.BookingId` → `Bookings.BookingId` (One-to-One)
- `DepositPayments.TransactionId` → `PaymentTransactions.TransactionId` (Many-to-One)
- `DepositPayments.BalanceTransactionId` → `PaymentTransactions.TransactionId` (Many-to-One)
- `CorporateInvoices.BookingId` → `Bookings.BookingId` (One-to-One)
- `CorporateInvoices.CorporateAccountId` → `CorporateAccounts.CorporateAccountId` (Many-to-One)

### Indexes

- `idx_balance_due` on `Bookings(BalanceDueDate, BalanceDue)` - Balance collection monitoring
- `idx_balance_due` on `DepositPayments(BalanceDueDate, BalancePaidAt)` - Reminder scheduling
- `idx_corporate_account` on `CorporateInvoices(CorporateAccountId, IssueDate DESC)` - Corporate invoice history
- `idx_status` on `CorporateInvoices(Status, DueDate)` - Overdue invoice monitoring

## Backend Specifications

### Business Logic

**Deposit Eligibility**:
- Minimum booking amount for deposit option (e.g., $200)
- Maximum advance booking period (e.g., 90 days)
- User must have verified payment method
- Supplier must allow deposit bookings

**Balance Collection**:
- Schedule balance due date (24-48 hours before pickup)
- Send reminder notifications (7 days, 3 days, 1 day before)
- Attempt automatic charge if enabled (1 day before due)
- Retry failed charges (3 attempts with 4-hour intervals)
- Cancel booking if balance not paid by due date
- Refund deposit per cancellation policy

**Pre-Authorization Management**:
- Calculate hold amount (rental + security deposit + 20% buffer)
- Validate card supports pre-authorization
- Place hold with 7-30 day expiration
- Monitor hold expiration and renew if needed
- Release hold after counter payment
- Capture hold for no-shows (per policy)

**Corporate Billing**:
- Verify corporate account status (active, credit available)
- Reserve credit limit for booking amount
- Generate invoice after rental completion
- Send invoice to billing contact
- Track payment status
- Send payment reminders (net 30 terms)
- Apply late fees per agreement
- Suspend corporate account for overdue invoices

### Error Handling

**Deposit Payment Failures**:
- Insufficient funds: Prompt to try different payment method
- Card declined: Offer alternative payment methods
- Gateway timeout: Retry with exponential backoff

**Balance Collection Failures**:
- Auto-charge failed: Send urgent notification to user
- Payment method expired: Request updated payment method
- All retries failed: Escalate to customer service

**Pre-Authorization Failures**:
- Card doesn't support pre-auth: Require different payment method
- Hold placement failed: Offer pay in full option
- Hold expired: Request new pre-authorization

## Technology Stack

- Backend: .NET 8+ with C# (ASP.NET Core Web API)
- Database: MySQL 8.0+
- Frontend: Next.js 14+ with TypeScript
- Payment Gateway: Stripe for pre-authorization and capture
- Notification Service: SendGrid for email, Twilio for SMS

## Implementation Notes

**Deposit Configuration**:
- Make deposit percentages configurable per supplier
- Set minimum booking amount for deposit eligibility
- Configure balance due timing (hours before pickup)
- Set reminder notification schedule

**Pre-Authorization Best Practices**:
- Hold amount should include buffer for potential charges
- Monitor hold expiration and renew if needed
- Release holds promptly to maintain customer trust
- Clearly communicate hold vs charge to customers

**Corporate Billing Setup**:
- Require corporate account verification
- Set credit limits per corporate account
- Configure payment terms (net 30, net 60)
- Implement approval workflows for large bookings
- Generate detailed invoices with line items

**Balance Collection Strategy**:
- Send friendly reminders, not aggressive demands
- Provide easy payment links in notifications
- Offer payment plan options for large balances
- Escalate to customer service before cancellation
- Maintain positive customer relationship

**Testing Requirements**:
- Test deposit payment and balance collection flow
- Test pre-authorization placement and release
- Test corporate billing invoice generation
- Test reminder notification scheduling
- Test automatic balance charge
- Test payment failure handling and retries

## Related Features

- F-PB-001: Multiple Payment Methods (Payment processing foundation)
- F-PB-003: BNPL Integration (Split payment option)
- F-BM-001: Multi-Step Checkout (Booking integration)
- F-INT-NOTIF-001: Notification Services (Reminder delivery)
