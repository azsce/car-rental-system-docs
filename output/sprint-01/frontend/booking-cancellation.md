# Feature: Booking Cancellation

## Overview

Self-service booking cancellation with automated refund processing, transparent policy enforcement, cancellation confirmation, partial refunds based on timing, and rebooking suggestions. The system provides clear visibility into cancellation policies and refund amounts before confirmation, enabling customers to cancel bookings without contacting support.

## Sprint Category

sprint-01

## Feature ID

F-BM-010

## User Stories

### User Story 1: Self-Service Cancellation
As a customer, I want to cancel my booking through the website or mobile app, so that I can manage my reservations without needing to contact customer support.

### User Story 2: Transparent Refund Policy
As a customer, I want to see the cancellation policy and refund amount before confirming cancellation, so that I understand exactly what I will receive back.

### User Story 3: Automated Refund Processing
As a customer, I want my refund to be processed automatically, so that I don't have to follow up or wait for manual processing.

### User Story 4: Cancellation Confirmation
As a customer, I want to receive immediate confirmation of my cancellation with refund details, so that I have peace of mind and documentation.

### User Story 5: Rebooking Assistance
As a customer who cancelled, I want to see alternative booking suggestions, so that I can easily rebook if my plans change again.

## Frontend Specifications

### Pages

**Booking Details Page** (`/bookings/[bookingId]`)
- Display complete booking information
- Show cancellation policy prominently
- Provide "Cancel Booking" button
- Display booking status

**Cancellation Confirmation Page** (`/bookings/[bookingId]/cancel`)
- Display booking summary
- Show cancellation policy details
- Calculate and display refund amount
- Show cancellation fee if applicable
- Confirmation screen with refund timeline

**Cancellation Success Page** (`/bookings/[bookingId]/cancelled`)
- Display cancellation confirmation
- Show refund amount and timeline
- Provide rebooking suggestions
- Offer customer support contact

### UI Components

**CancelBookingButton Component**
- Prominent "Cancel Booking" button on booking details
- Warning icon to indicate serious action
- Disabled state if cancellation not allowed
- Tooltip explaining cancellation policy

**CancellationPolicyDisplay Component**
- Clear presentation of cancellation terms
- Timeline showing free cancellation window
- Refund percentage based on timing
- Visual timeline with key dates
- Highlight current position in timeline

**RefundCalculator Component**
- Display original booking cost
- Show cancellation fee (if applicable)
- Calculate refund amount
- Display refund percentage
- Show refund timeline (5-10 business days)
- Highlight refund method (original payment method)

**CancellationReasonSelector Component**
- Optional dropdown for cancellation reason
- Predefined options (plans changed, found better price, emergency, etc.)
- Free text field for additional details
- "Prefer not to say" option

**CancellationConfirmation Component**
- Summary of booking being cancelled
- Refund amount prominently displayed
- Refund timeline information
- Terms and conditions checkbox
- "Confirm Cancellation" button (requires explicit confirmation)
- "Keep Booking" button to abort

**RebookingSuggestions Component**
- Display similar vehicles for alternative dates
- Show vehicles at same location
- Highlight special offers or discounts
- "Book Again" quick action buttons
- Filter by date range

**CancellationTimeline Component**
- Visual timeline showing cancellation windows
- Free cancellation period (green)
- Partial refund period (yellow)
- No refund period (red)
- Current date indicator
- Refund percentage for each period

### User Flows

**Flow 1: Cancel Booking with Full Refund**
1. Customer navigates to booking details page
2. Customer reviews booking information
3. Customer clicks "Cancel Booking" button
4. System displays cancellation confirmation page
5. System shows cancellation policy (free cancellation applies)
6. System calculates 100% refund amount
7. Customer optionally selects cancellation reason
8. Customer reviews refund amount and timeline
9. Customer checks terms and conditions
10. Customer clicks "Confirm Cancellation"
11. System processes cancellation
12. System initiates refund to original payment method
13. System displays cancellation success page
14. System sends cancellation confirmation email
15. System shows rebooking suggestions

**Flow 2: Cancel Booking with Partial Refund**
1. Customer initiates cancellation
2. System displays cancellation policy
3. System shows customer is outside free cancellation window
4. System calculates partial refund (e.g., 50%)
5. System displays cancellation fee
6. Customer sees refund amount will be reduced
7. Customer decides to proceed or keep booking
8. If proceeding, customer confirms cancellation
9. System processes partial refund
10. System sends confirmation with refund details

**Flow 3: Cancel Booking with No Refund**
1. Customer attempts to cancel close to pickup time
2. System displays no refund policy applies
3. System shows $0 refund amount
4. System explains late cancellation policy
5. Customer can still cancel (to avoid no-show fees)
6. Customer confirms cancellation understanding no refund
7. System cancels booking
8. System sends confirmation
9. System suggests rebooking with better cancellation terms

**Flow 4: Cancellation Not Allowed**
1. Customer attempts to cancel active or completed trip
2. System displays error message
3. System explains cancellation not possible
4. System provides customer support contact
5. Customer can contact support for assistance

### Data Requirements

**From Backend APIs:**
- Booking details (dates, vehicle, location, cost)
- Cancellation policy for booking
- Refund calculation based on current date
- Cancellation fee amount
- Refund processing timeline
- Alternative booking suggestions
- Customer support contact information

**State Management:**
- Current booking state
- Cancellation policy details
- Calculated refund amount
- Selected cancellation reason
- Confirmation status
- Refund processing status

## Backend Specifications

### API Endpoints

**GET /api/bookings/{bookingId}/cancellation-policy**
- Purpose: Retrieve cancellation policy and refund calculation
- Authentication: Required (JWT token)
- Response: Policy details, refund amount, fees

**POST /api/bookings/{bookingId}/calculate-refund**
- Purpose: Calculate refund amount for current date/time
- Authentication: Required
- Response: Refund amount, fees, refund percentage

**DELETE /api/bookings/{bookingId}**
- Purpose: Cancel booking and process refund
- Authentication: Required
- Request Body: Cancellation reason, confirmation
- Response: Cancellation confirmation, refund details

**GET /api/bookings/{bookingId}/rebooking-suggestions**
- Purpose: Get alternative booking suggestions after cancellation
- Authentication: Required
- Response: Array of suggested bookings

### Request Schemas

**CalculateRefundRequest**
```
{
  "cancellationDate": "ISO 8601 datetime (optional, defaults to now)"
}
```

**CancelBookingRequest**
```
{
  "reason": "string (optional)",
  "reasonDetails": "string (optional)",
  "confirmCancellation": "boolean (required, must be true)",
  "acceptNoRefund": "boolean (required if no refund applies)"
}
```

### Response Schemas

**CancellationPolicyResponse**
```
{
  "bookingId": "string",
  "cancellationAllowed": "boolean",
  "policy": {
    "freeCancellationUntil": "ISO 8601 datetime",
    "partialRefundUntil": "ISO 8601 datetime",
    "noRefundAfter": "ISO 8601 datetime",
    "refundPercentages": {
      "freeCancellation": 100,
      "partialRefund": 50,
      "lateCancel": 0
    }
  },
  "currentRefundPercentage": "number",
  "cancellationFee": "number",
  "message": "string"
}
```

**RefundCalculationResponse**
```
{
  "originalCost": "number",
  "cancellationFee": "number",
  "refundPercentage": "number",
  "refundAmount": "number",
  "refundMethod": "original_payment_method",
  "refundTimeline": "5-10 business days",
  "breakdown": {
    "baseRefund": "number",
    "serviceFees": "number",
    "taxes": "number"
  },
  "currency": "string"
}
```

**CancellationResponse**
```
{
  "bookingId": "string",
  "cancellationId": "string",
  "status": "cancelled",
  "cancelledAt": "ISO 8601 datetime",
  "refundAmount": "number",
  "refundStatus": "processing",
  "refundTransactionId": "string",
  "estimatedRefundDate": "ISO 8601 date",
  "confirmationEmailSent": "boolean",
  "message": "Booking successfully cancelled"
}
```

**RebookingSuggestionsResponse**
```
{
  "suggestions": [
    {
      "vehicleId": "string",
      "vehicleName": "string",
      "pickupDate": "ISO 8601 datetime",
      "returnDate": "ISO 8601 datetime",
      "locationId": "string",
      "locationName": "string",
      "totalCost": "number",
      "available": "boolean"
    }
  ]
}
```

### Business Logic

**Cancellation Eligibility**
- Booking status must be "confirmed" or "upcoming"
- Booking cannot be "active", "completed", or already "cancelled"
- User must be booking owner or authorized delegate
- System-wide cancellation must be enabled

**Refund Calculation Logic**
```
hoursUntilPickup = (pickupDate - currentDate) / 3600

if (hoursUntilPickup >= freeCancellationHours) {
  refundPercentage = 100
  cancellationFee = 0
} else if (hoursUntilPickup >= partialRefundHours) {
  refundPercentage = 50
  cancellationFee = originalCost * 0.10
} else {
  refundPercentage = 0
  cancellationFee = originalCost
}

refundAmount = (originalCost * refundPercentage / 100) - cancellationFee
```

**Cancellation Policy Rules**
- Free cancellation: 48+ hours before pickup (100% refund)
- Partial refund: 24-48 hours before pickup (50% refund, 10% fee)
- Late cancellation: <24 hours before pickup (0% refund)
- No-show: No refund, additional no-show fee may apply
- Force majeure: Full refund regardless of timing

**Cancellation Processing Workflow**
```
1. Validate cancellation request
2. Check user authorization
3. Verify booking is cancellable
4. Calculate refund amount
5. Lock booking record
6. Update booking status to "cancelled"
7. Release vehicle allocation
8. Update vehicle availability calendar
9. Initiate refund transaction
10. Send cancellation confirmation email
11. Notify supplier of cancellation
12. Log cancellation in audit trail
13. Generate rebooking suggestions
14. Release booking lock
```

**Refund Processing**
- Initiate refund to original payment method
- Queue refund for processing (typically 5-10 business days)
- Generate refund transaction record
- Send refund confirmation email
- Update booking payment status
- Handle refund failures with retry logic

**Notification Logic**
- Send immediate cancellation confirmation email
- Include refund amount and timeline
- Provide cancellation reference number
- Send SMS confirmation if enabled
- Notify supplier via email
- Update calendar invites (send cancellation)

### Authentication Requirements

- Valid JWT Bearer token required
- User must be booking owner
- Corporate admins can cancel organization bookings
- System admins can cancel any booking
- All cancellations logged with user ID

## Database Specifications

### Schema Changes

**booking_cancellations table** (new)
- Tracks all cancellations with refund details
- Stores cancellation reason and timing
- Links to original booking

**bookings table** (modifications)
- Add `cancelled_at` timestamp column
- Add `cancellation_reason` text column
- Add `refund_amount` decimal column
- Add `refund_status` enum column

### Table Definitions

**booking_cancellations**
```
CREATE TABLE booking_cancellations (
  cancellation_id VARCHAR(36) PRIMARY KEY,
  booking_id VARCHAR(36) NOT NULL,
  cancelled_by_user_id VARCHAR(36) NOT NULL,
  cancelled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Cancellation details
  hours_before_pickup DECIMAL(10,2),
  cancellation_reason ENUM('plans_changed', 'found_better_price', 'emergency', 'vehicle_issue', 'other') DEFAULT 'other',
  reason_details TEXT,
  
  -- Financial
  original_cost DECIMAL(10,2) NOT NULL,
  cancellation_fee DECIMAL(10,2) DEFAULT 0.00,
  refund_percentage INT NOT NULL,
  refund_amount DECIMAL(10,2) NOT NULL,
  refund_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  refund_transaction_id VARCHAR(100),
  refund_completed_at TIMESTAMP,
  
  -- Notifications
  confirmation_email_sent BOOLEAN DEFAULT FALSE,
  supplier_notified BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
  FOREIGN KEY (cancelled_by_user_id) REFERENCES users(user_id),
  
  INDEX idx_booking_cancellations (booking_id),
  INDEX idx_cancelled_at (cancelled_at),
  INDEX idx_refund_status (refund_status),
  INDEX idx_cancellation_reason (cancellation_reason)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**bookings table updates**
```
ALTER TABLE bookings
ADD COLUMN cancelled_at TIMESTAMP NULL,
ADD COLUMN cancellation_reason TEXT,
ADD COLUMN refund_amount DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN refund_status ENUM('none', 'pending', 'processing', 'completed', 'failed') DEFAULT 'none',
ADD INDEX idx_cancelled_at (cancelled_at),
ADD INDEX idx_refund_status (refund_status);
```

### Relationships

**booking_cancellations → bookings**
- One-to-one relationship
- Each cancellation belongs to one booking
- One booking can have at most one cancellation
- Foreign key: `booking_id`
- Cascade delete when booking deleted

**booking_cancellations → users**
- Many-to-one relationship
- Each cancellation made by one user
- Foreign key: `cancelled_by_user_id`

### Indexes

```sql
CREATE INDEX idx_booking_cancellations ON booking_cancellations(booking_id);
CREATE INDEX idx_cancelled_at ON booking_cancellations(cancelled_at);
CREATE INDEX idx_refund_status ON booking_cancellations(refund_status);
CREATE INDEX idx_cancellation_reason ON booking_cancellations(cancellation_reason);
CREATE INDEX idx_hours_before_pickup ON booking_cancellations(hours_before_pickup);
```

## Technology Stack

- **Backend**: .NET 8+ with C#, ASP.NET Core Web API
- **Database**: MySQL 8.0+ with InnoDB storage engine
- **Frontend**: Next.js 14+ with React 18+, TypeScript
- **Payment Processing**: Stripe or PayPal SDK for refunds
- **Email**: SendGrid or AWS SES
- **Notifications**: Firebase Cloud Messaging

## Implementation Notes

### Cancellation Policy Configuration
- Store policies in database for flexibility
- Support supplier-specific policies
- Allow seasonal policy variations
- Enable force majeure exceptions

### Refund Processing
- Use payment gateway refund APIs
- Handle partial refunds correctly
- Support multiple payment methods
- Implement retry logic for failed refunds
- Track refund status throughout process

### User Experience
- Make cancellation process clear and simple
- Provide transparent refund information
- Offer alternatives before cancellation
- Support easy rebooking
- Minimize steps to cancel

### Error Handling
- Handle booking state conflicts
- Manage payment processing failures
- Provide clear error messages
- Support customer service escalation
- Log all cancellation attempts

### Performance
- Cache cancellation policies
- Optimize refund calculations
- Use async processing for refunds
- Implement efficient database queries
- Monitor cancellation processing times

### Security
- Validate user authorization
- Prevent fraudulent cancellations
- Log all cancellation attempts
- Secure refund processing
- Protect against abuse

### Monitoring & Analytics
- Track cancellation rates by timing
- Monitor refund processing success
- Analyze cancellation reasons
- Identify patterns and trends
- Alert on unusual cancellation activity
