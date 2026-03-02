# Feature: Split Payment & Platform Wallet System

## Overview

Comprehensive payment flexibility system combining split payment capabilities for group bookings with an internal platform wallet for storing credits, refunds, and promotional balances. Enables multiple payment sources for single bookings, group cost sharing, custom payment splits, payment tracking, automatic booking completion, proportional refund distribution, wallet balance management, promotional credit storage, referral rewards, and multi-currency wallet support.

## Sprint Category

nice-to-have (Nice-to-have - Would be great but not essential)

## Feature IDs

F-PB-013 (Split Payment & Group Billing)
F-PB-016 (Platform Wallet System)
F-MOB-PAY-006 (Mobile Wallet Integration)

## User Stories

### As a group traveler
I want to split the rental cost among multiple people, so that each person can pay their fair share directly.

### As a corporate traveler
I want to split payment between personal and business cards, so that I can properly categorize expenses.

### As a frequent customer
I want to store credits in a platform wallet, so that I can use them for faster checkout on future bookings.

### As a customer receiving a refund
I want the option to receive refunds as instant wallet credit, so that I don't have to wait 3-5 days for bank processing.

### As a referrer
I want to earn wallet credits for successful referrals, so that I'm rewarded for bringing new customers to the platform.

## Frontend Specifications

### Pages

**Split Payment Page** (`/booking/split-payment`)
- Add payment sources interface
- Define split amounts or percentages
- Invite co-payers via email/SMS
- Track payment status per contributor
- Complete booking when fully paid

**Wallet Dashboard Page** (`/account/wallet`)
- Current wallet balance display
- Add funds interface
- Transaction history
- Promotional credits with expiration
- Referral rewards tracking
- Multi-currency balance display

**Group Payment Invitation Page** (`/payment/group/{inviteToken}`)
- Booking details display
- Amount owed display
- Payment method selection
- Pay share button
- Payment confirmation

### UI Components

**SplitPaymentBuilder Component**
- Add payment source button
- Payment source list with amounts
- Split type selector (equal, custom, percentage)
- Amount input for each source
- Total and remaining amount display
- Validation messages
- Remove payment source button

**GroupInviteForm Component**
- Email/phone input for co-payers
- Amount assignment per person
- Custom message input
- Send invitation button
- Invitation status tracking
- Resend invitation option

**PaymentStatusTracker Component**
- Visual progress bar showing paid amount
- List of contributors with payment status
- Paid/pending indicators
- Amount paid per contributor
- Reminder button for pending payments
- Booking completion status

**WalletBalanceCard Component**
- Large balance display with currency
- Add funds button
- Use wallet balance toggle
- Available vs pending balance
- Multi-currency balance tabs
- Recent transactions preview

**AddFundsModal Component**
- Amount input
- Payment method selection
- Minimum/maximum amount validation
- Processing fee display (if applicable)
- Confirm button
- Success confirmation

**PromotionalCreditsSection Component**
- List of promotional credits
- Credit amount and source
- Expiration date countdown
- Terms and conditions link
- Apply to booking button

**ReferralRewardsCard Component**
- Referral link display
- Copy link button
- Successful referrals count
- Pending rewards
- Earned rewards total
- Reward history

### User Flows

**Split Payment Flow**:
1. User proceeds to payment in booking checkout
2. User selects "Split Payment" option
3. System displays split payment builder
4. User selects split type (equal, custom, percentage)
5. User adds payment sources (own cards or invite others)
6. User assigns amounts to each source
7. System validates total equals booking amount
8. User processes own payment portion
9. System sends invitations to co-payers
10. Co-payers receive email/SMS with payment link
11. Co-payers complete their payment portions
12. System tracks payment status
13. System confirms booking when fully paid

**Wallet Payment Flow**:
1. User proceeds to payment in booking checkout
2. System displays wallet balance
3. User toggles "Use wallet balance"
4. System applies wallet balance to booking
5. If balance insufficient, user pays difference with card
6. If balance sufficient, booking paid entirely from wallet
7. System deducts amount from wallet
8. System confirms booking
9. User receives confirmation with wallet transaction

**Add Funds to Wallet Flow**:
1. User navigates to Wallet Dashboard
2. User clicks "Add Funds"
3. System displays add funds modal
4. User enters amount
5. User selects payment method
6. System displays processing fee if applicable
7. User confirms
8. System processes payment
9. System credits wallet immediately
10. User sees updated balance

**Refund to Wallet Flow**:
1. User cancels booking
2. System calculates refund amount
3. System displays refund options (original method or wallet)
4. User selects "Refund to Wallet"
5. System credits wallet instantly
6. User receives notification
7. User can use credit immediately for new booking

### Data Requirements

**From Backend APIs**:
- POST `/api/split-payments/create` - Create split payment
- POST `/api/split-payments/invite` - Invite co-payers
- GET `/api/split-payments/{id}/status` - Track payment status
- POST `/api/split-payments/{id}/pay` - Pay individual share
- GET `/api/wallet/balance` - Get wallet balance
- POST `/api/wallet/add-funds` - Add funds to wallet
- POST `/api/wallet/pay` - Pay with wallet balance
- GET `/api/wallet/transactions` - Wallet transaction history
- GET `/api/wallet/credits` - Get promotional credits
- POST `/api/wallet/transfer` - Transfer between currencies

## Backend Specifications

### API Endpoints

**POST `/api/v1/split-payments`**
- Purpose: Create split payment for booking
- Authentication: Required (JWT)
- Request Body:
  - `bookingId` (guid, required)
  - `splits` (array, required): Payment split definitions
  - `splitType` (string, required): equal, custom, percentage
- Response: Split payment ID and invitation tokens

**POST `/api/v1/split-payments/{id}/invite`**
- Purpose: Send payment invitations to co-payers
- Authentication: Required (JWT)
- Path Parameters:
  - `id` (guid, required): Split payment ID
- Request Body:
  - `invitations` (array, required): Email/phone and amount per person
- Response: Invitation status

**GET `/api/v1/split-payments/{id}/status`**
- Purpose: Get payment status for split booking
- Authentication: Required (JWT)
- Path Parameters:
  - `id` (guid, required): Split payment ID
- Response: Payment status per contributor

**POST `/api/v1/split-payments/{id}/pay`**
- Purpose: Pay individual share of split payment
- Authentication: Required (JWT or invitation token)
- Path Parameters:
  - `id` (guid, required): Split payment ID
- Request Body:
  - `contributorId` (guid, required)
  - `paymentMethodId` (guid, required)
- Response: Payment confirmation

**GET `/api/v1/wallet/balance`**
- Purpose: Get user's wallet balance
- Authentication: Required (JWT)
- Query Parameters:
  - `currency` (string, optional): Specific currency balance
- Response: Wallet balance(s)

**POST `/api/v1/wallet/add-funds`**
- Purpose: Add funds to wallet
- Authentication: Required (JWT)
- Request Body:
  - `amount` (decimal, required)
  - `currency` (string, required)
  - `paymentMethodId` (guid, required)
- Response: Transaction confirmation

**POST `/api/v1/wallet/pay`**
- Purpose: Pay for booking using wallet balance
- Authentication: Required (JWT)
- Request Body:
  - `bookingId` (guid, required)
  - `amount` (decimal, required)
  - `currency` (string, required)
- Response: Payment confirmation

**GET `/api/v1/wallet/transactions`**
- Purpose: Get wallet transaction history
- Authentication: Required (JWT)
- Query Parameters:
  - `page` (int, optional)
  - `pageSize` (int, optional)
- Response: Paginated wallet transactions

**GET `/api/v1/wallet/credits`**
- Purpose: Get promotional credits
- Authentication: Required (JWT)
- Response: Array of promotional credits with expiration

### Business Logic

**Split Payment Management**:
- Validate split amounts equal booking total
- Generate unique invitation tokens for co-payers
- Send invitation emails/SMS with payment links
- Track payment status per contributor
- Process individual payments as they arrive
- Confirm booking when all payments received
- Handle partial payment refunds proportionally
- Expire unpaid invitations after 48 hours

**Wallet Balance Management**:
- Maintain separate balances per currency
- Track available vs pending balance
- Apply promotional credits with expiration rules
- Process wallet payments atomically
- Handle insufficient balance scenarios
- Support partial wallet + card payments
- Prevent negative balances

**Promotional Credits**:
- Issue credits for referrals, promotions, compensations
- Set expiration dates per credit type
- Apply oldest credits first (FIFO)
- Notify users of expiring credits (7 days before)
- Expire unused credits automatically
- Track credit source and usage

**Refund to Wallet**:
- Offer wallet refund option during cancellation
- Credit wallet instantly (vs 3-5 days for card refund)
- Apply refund to same currency as original payment
- Track refund source in wallet transaction
- Allow wallet credit usage immediately

### Authentication Requirements

- JWT token required for all wallet endpoints
- User can only access own wallet
- Split payment invitations use temporary tokens
- Admin role can view wallet transactions for support
- Wallet transfers require additional verification

## Database Specifications

### Schema Changes

**New Tables**:
- `WalletBalances` - User wallet balances
- `WalletTransactions` - Wallet transaction history
- `PromotionalCredits` - Promotional credit tracking
- `SplitPayments` - Split payment configurations
- `SplitPaymentContributors` - Individual payment shares

### Table Definitions

**WalletBalances Table**:
```sql
CREATE TABLE WalletBalances (
  WalletBalanceId CHAR(36) PRIMARY KEY,
  UserId CHAR(36) NOT NULL,
  Currency CHAR(3) NOT NULL,
  AvailableBalance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  PendingBalance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  TotalCredits DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  TotalDebits DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  LastTransactionAt DATETIME NULL,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE,
  
  INDEX idx_user_id (UserId),
  UNIQUE KEY uk_user_currency (UserId, Currency)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**WalletTransactions Table**:
```sql
CREATE TABLE WalletTransactions (
  WalletTransactionId CHAR(36) PRIMARY KEY,
  UserId CHAR(36) NOT NULL,
  TransactionType ENUM('credit', 'debit', 'refund', 'promotional', 'referral', 'transfer') NOT NULL,
  Amount DECIMAL(10,2) NOT NULL,
  Currency CHAR(3) NOT NULL,
  BalanceBefore DECIMAL(10,2) NOT NULL,
  BalanceAfter DECIMAL(10,2) NOT NULL,
  RelatedBookingId CHAR(36) NULL,
  RelatedTransactionId CHAR(36) NULL,
  Description VARCHAR(255) NOT NULL,
  Source VARCHAR(100) NULL COMMENT 'add_funds, refund, promo_code, referral',
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE,
  FOREIGN KEY (RelatedBookingId) REFERENCES Bookings(BookingId) ON DELETE SET NULL,
  FOREIGN KEY (RelatedTransactionId) REFERENCES PaymentTransactions(TransactionId) ON DELETE SET NULL,
  
  INDEX idx_user_id (UserId, CreatedAt DESC),
  INDEX idx_transaction_type (TransactionType, CreatedAt DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**PromotionalCredits Table**:
```sql
CREATE TABLE PromotionalCredits (
  CreditId CHAR(36) PRIMARY KEY,
  UserId CHAR(36) NOT NULL,
  Amount DECIMAL(10,2) NOT NULL,
  Currency CHAR(3) NOT NULL,
  RemainingAmount DECIMAL(10,2) NOT NULL,
  CreditType ENUM('referral', 'promotion', 'compensation', 'loyalty') NOT NULL,
  Source VARCHAR(255) NOT NULL COMMENT 'Promo code, referral ID, etc.',
  ExpiresAt DATETIME NULL,
  IsExpired BOOLEAN DEFAULT FALSE,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UsedAt DATETIME NULL,
  
  FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE,
  
  INDEX idx_user_active (UserId, IsExpired, ExpiresAt),
  INDEX idx_expires_at (ExpiresAt, IsExpired)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**SplitPayments Table**:
```sql
CREATE TABLE SplitPayments (
  SplitPaymentId CHAR(36) PRIMARY KEY,
  BookingId CHAR(36) NOT NULL,
  InitiatorUserId CHAR(36) NOT NULL,
  TotalAmount DECIMAL(10,2) NOT NULL,
  Currency CHAR(3) NOT NULL,
  PaidAmount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  RemainingAmount DECIMAL(10,2) NOT NULL,
  Status ENUM('pending', 'partial', 'completed', 'expired', 'cancelled') NOT NULL,
  ExpiresAt DATETIME NOT NULL,
  CompletedAt DATETIME NULL,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId) ON DELETE CASCADE,
  FOREIGN KEY (InitiatorUserId) REFERENCES Users(UserId) ON DELETE CASCADE,
  
  INDEX idx_booking_id (BookingId),
  INDEX idx_status (Status, ExpiresAt),
  UNIQUE KEY uk_booking_split (BookingId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**SplitPaymentContributors Table**:
```sql
CREATE TABLE SplitPaymentContributors (
  ContributorId CHAR(36) PRIMARY KEY,
  SplitPaymentId CHAR(36) NOT NULL,
  UserId CHAR(36) NULL COMMENT 'NULL if not registered',
  Email VARCHAR(255) NULL,
  Phone VARCHAR(20) NULL,
  AmountOwed DECIMAL(10,2) NOT NULL,
  AmountPaid DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  PaymentStatus ENUM('pending', 'paid', 'failed', 'expired') NOT NULL,
  InvitationToken VARCHAR(255) NOT NULL,
  InvitedAt DATETIME NOT NULL,
  PaidAt DATETIME NULL,
  PaymentTransactionId CHAR(36) NULL,
  RemindersSent INT DEFAULT 0,
  LastReminderAt DATETIME NULL,
  
  FOREIGN KEY (SplitPaymentId) REFERENCES SplitPayments(SplitPaymentId) ON DELETE CASCADE,
  FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE SET NULL,
  FOREIGN KEY (PaymentTransactionId) REFERENCES PaymentTransactions(TransactionId) ON DELETE SET NULL,
  
  INDEX idx_split_payment (SplitPaymentId),
  INDEX idx_invitation_token (InvitationToken),
  INDEX idx_status (PaymentStatus, InvitedAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Relationships

- `WalletBalances.UserId` → `Users.UserId` (Many-to-One)
- `WalletTransactions.UserId` → `Users.UserId` (Many-to-One)
- `WalletTransactions.RelatedBookingId` → `Bookings.BookingId` (Many-to-One)
- `PromotionalCredits.UserId` → `Users.UserId` (Many-to-One)
- `SplitPayments.BookingId` → `Bookings.BookingId` (One-to-One)
- `SplitPayments.InitiatorUserId` → `Users.UserId` (Many-to-One)
- `SplitPaymentContributors.SplitPaymentId` → `SplitPayments.SplitPaymentId` (Many-to-One)
- `SplitPaymentContributors.UserId` → `Users.UserId` (Many-to-One)

### Indexes

- `idx_user_id` on `WalletBalances(UserId)` - Balance lookup
- `idx_user_id` on `WalletTransactions(UserId, CreatedAt DESC)` - Transaction history
- `idx_user_active` on `PromotionalCredits(UserId, IsExpired, ExpiresAt)` - Active credits
- `idx_booking_id` on `SplitPayments(BookingId)` - Split payment lookup
- `idx_invitation_token` on `SplitPaymentContributors(InvitationToken)` - Invitation validation

## Backend Specifications

### Business Logic

**Split Payment Creation**:
- Validate split amounts equal booking total
- Create split payment record
- Generate unique invitation tokens
- Send invitations via email/SMS
- Set expiration (48 hours)
- Track payment status per contributor

**Split Payment Processing**:
- Validate invitation token
- Process individual payment
- Update contributor status
- Update split payment totals
- Check if fully paid
- Confirm booking if complete
- Send notifications to initiator

**Wallet Credit Management**:
- Credit wallet for add funds transactions
- Debit wallet for booking payments
- Apply promotional credits with expiration
- Track credit source and usage
- Prevent negative balances
- Handle multi-currency conversions

**Promotional Credit Application**:
- Apply oldest credits first (FIFO)
- Check credit expiration before use
- Validate credit eligibility (user, booking type)
- Deduct used amount from credit
- Mark credit as fully used when depleted
- Track credit usage for analytics

**Refund Distribution**:
- For split payments: Refund proportionally to each contributor
- For wallet payments: Offer instant wallet credit option
- For mixed payments: Refund to original sources proportionally
- Track refund distribution for audit

### Authentication Requirements

- JWT token required for wallet operations
- Invitation token valid for split payment contributions
- User can only access own wallet
- Admin role can issue promotional credits
- Supplier role cannot access user wallets

## Technology Stack

- Backend: .NET 8+ with C#
- Database: MySQL 8.0+
- Frontend: Next.js 14+ with TypeScript
- Notification Service: SendGrid, Twilio
- Currency Conversion: Exchange rate API

## Implementation Notes

**Wallet Security**:
- Implement transaction atomicity (ACID)
- Use database transactions for balance updates
- Prevent race conditions with row locking
- Audit all wallet transactions
- Implement fraud detection for large wallet transactions

**Split Payment Expiration**:
- Run background job to expire unpaid splits
- Send reminders before expiration (24 hours, 6 hours)
- Cancel booking if not fully paid by expiration
- Refund paid contributors if booking cancelled

**Multi-Currency Support**:
- Store separate balance per currency
- Use exchange rate API for conversions
- Apply conversion fees transparently
- Display all balances in user's preferred currency

**Promotional Credit Rules**:
- Set expiration dates per credit type
- Referral credits: 90 days
- Promotional codes: Per campaign
- Compensation credits: 1 year
- Notify users of expiring credits

**Testing Requirements**:
- Test split payment creation and tracking
- Test wallet credit and debit operations
- Test promotional credit application
- Test refund distribution
- Test multi-currency wallet
- Test split payment expiration
- Verify transaction atomicity

## Related Features

- F-PB-001: Multiple Payment Methods (Payment processing)
- F-AM-015: Loyalty Program (Reward credits)
- F-AM-016: Referral Program (Referral credits)
- F-BM-015: Group Booking (Group travel integration)
