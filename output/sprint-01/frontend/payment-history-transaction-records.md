# Feature: Payment History & Transaction Records

## Overview

Complete record of all payment transactions with chronological history, detailed transaction information, receipt access, refund tracking, failed payment history, pending payment monitoring, search and filter capabilities, and export functionality (CSV, PDF, Excel). Provides comprehensive audit trail for personal expense tracking, business accounting, and tax documentation purposes.

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature ID

F-PB-010

## User Stories

### As a customer
I want to view my complete payment history, so that I can track my spending and access receipts for my records.

### As a business traveler
I want to export my payment history, so that I can submit it for expense reimbursement and accounting.

### As a user managing refunds
I want to track the status of my refunds, so that I know when to expect the money back in my account.

### As a user troubleshooting payments
I want to see failed payment attempts, so that I can understand what went wrong and resolve payment issues.

## Frontend Specifications

### Pages

**Payment History Page** (`/account/payments`)
- Chronological list of all transactions
- Filter by date range, status, amount, or booking
- Search by transaction ID or booking reference
- Pagination for large transaction lists
- Export button for CSV/PDF/Excel
- Summary statistics (total spent, refunds received)

**Transaction Detail Page** (`/account/payments/{transactionId}`)
- Complete transaction information
- Payment method used
- Amount and currency
- Transaction status with timeline
- Booking reference link
- Receipt download button
- Refund information if applicable
- Support contact for disputes

### UI Components

**TransactionList Component**
- Table or card layout for transactions
- Date, amount, status, booking reference columns
- Status badges (completed, pending, failed, refunded)
- Quick actions (view details, download receipt)
- Infinite scroll or pagination
- Empty state for no transactions
- Loading skeleton

**TransactionCard Component**
- Transaction date and time
- Amount with currency
- Payment method icon and masked details
- Status indicator with color coding
- Booking reference with link
- Receipt download button
- Expand for more details

**TransactionFilters Component**
- Date range picker (last 30 days, 90 days, year, custom)
- Status filter (all, completed, pending, failed, refunded)
- Amount range filter
- Payment method filter
- Booking filter
- Clear all filters button

**TransactionSearch Component**
- Search input with autocomplete
- Search by transaction ID
- Search by booking reference
- Search by amount
- Search results highlighting

**RefundTracker Component**
- Refund status timeline
- Original transaction reference
- Refund amount
- Refund method
- Expected completion date
- Actual completion date
- Status updates (initiated, processing, completed)

**ExportOptions Component**
- Format selection (CSV, PDF, Excel)
- Date range selection
- Include/exclude filters
- Export button with loading state
- Download confirmation

### User Flows

**View Payment History Flow**:
1. User navigates to Payment History page
2. System loads recent transactions (last 30 days)
3. User sees chronological list of transactions
4. User applies filters (date range, status)
5. System updates transaction list
6. User clicks on transaction for details
7. System displays complete transaction information
8. User downloads receipt PDF
9. System generates and downloads receipt

**Track Refund Flow**:
1. User views payment history
2. User filters by "Refunded" status
3. System displays refund transactions
4. User clicks on refund transaction
5. System shows refund timeline and status
6. User sees expected completion date
7. System updates status when refund completes
8. User receives notification of refund completion

**Export Transaction History Flow**:
1. User clicks "Export" button
2. System displays export options modal
3. User selects date range and format
4. User clicks "Export"
5. System generates export file
6. System downloads file to user's device
7. User opens file for expense reporting

### Data Requirements

**From Backend APIs**:
- GET `/api/payments/history` - Retrieve payment history
- GET `/api/payments/{transactionId}` - Get transaction details
- GET `/api/payments/{transactionId}/receipt` - Download receipt
- GET `/api/refunds/{refundId}` - Get refund details
- GET `/api/payments/export` - Export transaction history
- GET `/api/payments/pending` - Get pending payments
- GET `/api/payments/failed` - Get failed payment attempts

**Transaction Data**:
- Transaction ID and timestamp
- Amount and currency
- Payment method used
- Transaction status
- Booking reference
- Receipt URL
- Refund information
- Error details for failed payments

## Backend Specifications

### API Endpoints

**GET `/api/v1/payments/history`**
- Purpose: Retrieve user's payment transaction history
- Authentication: Required (JWT)
- Query Parameters:
  - `startDate` (date, optional): Filter from date
  - `endDate` (date, optional): Filter to date
  - `status` (string, optional): Filter by status
  - `paymentMethod` (string, optional): Filter by method type
  - `page` (int, optional): Page number (default 1)
  - `pageSize` (int, optional): Items per page (default 20)
  - `sortBy` (string, optional): Sort field (default: createdAt)
  - `sortOrder` (string, optional): asc or desc (default: desc)
- Response: Paginated transaction list with metadata

**GET `/api/v1/payments/{transactionId}`**
- Purpose: Get detailed transaction information
- Authentication: Required (JWT)
- Authorization: User must own transaction or have Admin role
- Path Parameters:
  - `transactionId` (guid, required): Transaction ID
- Response: Complete transaction details

**GET `/api/v1/payments/{transactionId}/receipt`**
- Purpose: Download transaction receipt
- Authentication: Required (JWT)
- Authorization: User must own transaction
- Path Parameters:
  - `transactionId` (guid, required): Transaction ID
- Query Parameters:
  - `format` (string, optional): pdf or html (default: pdf)
- Response: Receipt file (PDF or HTML)

**GET `/api/v1/refunds/{refundId}`**
- Purpose: Get refund transaction details
- Authentication: Required (JWT)
- Authorization: User must own refund
- Path Parameters:
  - `refundId` (guid, required): Refund ID
- Response: Refund details with status timeline

**GET `/api/v1/payments/export`**
- Purpose: Export payment history
- Authentication: Required (JWT)
- Query Parameters:
  - `startDate` (date, required): Export from date
  - `endDate` (date, required): Export to date
  - `format` (string, required): csv, pdf, or excel
  - `includeRefunds` (boolean, optional): Include refund transactions
- Response: Export file

**GET `/api/v1/payments/pending`**
- Purpose: Get pending payment transactions
- Authentication: Required (JWT)
- Response: Array of pending transactions with due dates

**GET `/api/v1/payments/failed`**
- Purpose: Get failed payment attempts
- Authentication: Required (JWT)
- Query Parameters:
  - `limit` (int, optional): Number of records (default 10)
- Response: Array of failed transactions with error details

### Request Schemas

**ExportPaymentHistoryRequest**:
```
{
  startDate: date,
  endDate: date,
  format: "csv" | "pdf" | "excel",
  includeRefunds: boolean,
  filters: {
    status: string[],
    paymentMethods: string[]
  }
}
```

### Response Schemas

**PaymentHistoryResponse**:
```
{
  transactions: [
    {
      transactionId: guid,
      bookingId: guid,
      bookingReference: string,
      amount: decimal,
      currency: string,
      paymentMethod: string,
      maskedDetails: string,
      status: string,
      transactionType: string,
      createdAt: datetime,
      completedAt: datetime,
      receiptUrl: string
    }
  ],
  pagination: {
    page: int,
    pageSize: int,
    totalPages: int,
    totalRecords: int
  },
  summary: {
    totalSpent: decimal,
    totalRefunded: decimal,
    pendingAmount: decimal,
    transactionCount: int
  }
}
```

**TransactionDetailResponse**:
```
{
  transactionId: guid,
  bookingId: guid,
  bookingReference: string,
  amount: decimal,
  currency: string,
  transactionType: string,
  status: string,
  paymentMethod: {
    type: string,
    displayName: string,
    maskedDetails: string
  },
  gatewayTransactionId: string,
  gatewayName: string,
  fraudScore: decimal,
  metadata: {
    ipAddress: string,
    deviceFingerprint: string,
    userAgent: string
  },
  errorCode: string,
  errorMessage: string,
  createdAt: datetime,
  completedAt: datetime,
  receiptUrl: string,
  refundInfo: {
    refundId: guid,
    refundAmount: decimal,
    refundStatus: string,
    refundedAt: datetime
  }
}
```

**RefundDetailResponse**:
```
{
  refundId: guid,
  originalTransactionId: guid,
  amount: decimal,
  currency: string,
  refundType: string,
  status: string,
  timeline: [
    {
      status: string,
      timestamp: datetime,
      note: string
    }
  ],
  expectedCompletionDate: date,
  completedAt: datetime,
  refundMethod: string
}
```

### Business Logic

**Transaction History Retrieval**:
- Query transactions for authenticated user
- Apply date range filters
- Apply status filters
- Apply payment method filters
- Sort by specified field and order
- Paginate results
- Calculate summary statistics
- Include refund information for refunded transactions

**Receipt Generation**:
- Retrieve transaction details
- Load associated booking information
- Generate receipt HTML from template
- Convert to PDF if requested
- Store PDF in cloud storage
- Return receipt URL or file

**Export Generation**:
- Query transactions for date range
- Apply filters if specified
- Format data for export type:
  - CSV: Comma-separated values with headers
  - PDF: Professional report layout
  - Excel: Formatted spreadsheet with formulas
- Generate file asynchronously for large exports
- Provide download link when ready

**Refund Tracking**:
- Retrieve refund transaction details
- Build status timeline from transaction events
- Calculate expected completion date (3-5 business days)
- Display current status
- Send notifications on status changes

### Authentication Requirements

- JWT token required for all payment history endpoints
- User can only access own transaction history
- Admin role can access all transactions
- Supplier role can access transactions for their bookings
- Corporate admin can access company transaction history

## Database Specifications

### Schema Changes

No new tables required. Uses existing:
- `PaymentTransactions` table
- `RefundTransactions` table
- `PaymentMethods` table
- `Bookings` table

### Indexes

Existing indexes support payment history queries:
- `idx_user_id` on `PaymentTransactions(UserId, CreatedAt DESC)` - User transaction history
- `idx_status` on `PaymentTransactions(Status, CreatedAt)` - Status filtering
- `idx_booking_id` on `PaymentTransactions(BookingId)` - Booking transactions
- `idx_user_id` on `RefundTransactions(UserId, CreatedAt DESC)` - User refund history

## Technology Stack

- Backend: .NET 8+ with C#
- Database: MySQL 8.0+
- Frontend: Next.js 14+ with TypeScript
- PDF Generation: PuppeteerSharp
- Export Generation: EPPlus for Excel, CsvHelper for CSV

## Implementation Notes

**Performance Optimization**:
- Implement pagination for large transaction lists
- Cache recent transactions in Redis
- Use database indexes for efficient filtering
- Lazy load transaction details
- Implement virtual scrolling for long lists

**Receipt Storage**:
- Generate receipts on-demand or cache after first generation
- Store PDFs in cloud storage (S3, Azure Blob)
- Set receipt URLs to expire after 30 days for security
- Regenerate receipts if URL expired

**Export Limits**:
- Limit export to 1 year of data per request
- Generate large exports asynchronously
- Send email notification when export ready
- Expire export files after 7 days

**Mobile Optimization**:
- Responsive transaction list layout
- Touch-friendly filters and search
- Swipe actions for quick access
- Optimized PDF viewing on mobile
- Share receipt via native share sheet

**Testing Requirements**:
- Test transaction history retrieval with various filters
- Test pagination and sorting
- Test receipt generation and download
- Test export functionality for all formats
- Test refund tracking display
- Verify performance with large transaction volumes

## Related Features

- F-PB-009: Comprehensive Invoice Generation (Receipt generation)
- F-PB-001: Multiple Payment Methods (Payment processing)
- F-BM-011: Booking History Dashboard (Booking history integration)
