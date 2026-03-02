# Feature: Booking Cancellation (Backend)

## Overview

Backend services for self-service booking cancellation with automated refund processing, policy enforcement, and rebooking suggestions.

## Sprint Category

sprint-01

## Feature ID

F-BM-010

## API Endpoints

### GET /api/bookings/{bookingId}/cancellation-policy

**Response**: 200 OK
```json
{
  "bookingId": "BK-2026-001234",
  "cancellationAllowed": true,
  "policy": {
    "freeCancellationUntil": "2026-03-18T10:00:00Z",
    "partialRefundUntil": "2026-03-19T10:00:00Z",
    "noRefundAfter": "2026-03-19T10:00:00Z",
    "refundPercentages": {
      "freeCancellation": 100,
      "partialRefund": 50,
      "lateCancel": 0
    }
  },
  "currentRefundPercentage": 100,
  "cancellationFee": 0.00,
  "message": "Free cancellation available"
}
```

### POST /api/bookings/{bookingId}/calculate-refund

**Response**: 200 OK
```json
{
  "originalCost": 450.00,
  "cancellationFee": 0.00,
  "refundPercentage": 100,
  "refundAmount": 450.00,
  "refundMethod": "original_payment_method",
  "refundTimeline": "5-10 business days",
  "breakdown": {
    "baseRefund": 400.00,
    "serviceFees": 30.00,
    "taxes": 20.00
  },
  "currency": "USD"
}
```

### DELETE /api/bookings/{bookingId}

**Request Body:**
```json
{
  "reason": "plans_changed",
  "reasonDetails": "Travel dates changed due to work",
  "confirmCancellation": true,
  "acceptNoRefund": false
}
```

**Response**: 200 OK
```json
{
  "bookingId": "BK-2026-001234",
  "cancellationId": "CAN-2026-5678",
  "status": "cancelled",
  "cancelledAt": "2026-02-23T14:30:00Z",
  "refundAmount": 450.00,
  "refundStatus": "processing",
  "refundTransactionId": "REF-2026-9876",
  "estimatedRefundDate": "2026-03-05",
  "confirmationEmailSent": true,
  "message": "Booking successfully cancelled"
}
```

### GET /api/bookings/{bookingId}/rebooking-suggestions

**Response**: 200 OK
```json
{
  "suggestions": [
    {
      "vehicleId": "VEH-2026-5678",
      "vehicleName": "Toyota Camry",
      "pickupDate": "2026-03-25T10:00:00Z",
      "returnDate": "2026-03-28T10:00:00Z",
      "locationId": "LOC-NYC-001",
      "locationName": "New York JFK Airport",
      "totalCost": 425.00,
      "available": true
    }
  ]
}
```

## Business Logic

### Cancellation Eligibility
```
if (booking.status === 'active' || booking.status === 'completed') {
  return error('Cannot cancel active or completed booking')
}
if (booking.status === 'cancelled') {
  return error('Booking already cancelled')
}
if (user.id !== booking.userId && !user.isAdmin) {
  return error('Not authorized to cancel this booking')
}
return true
```

### Refund Calculation
```
hoursUntilPickup = (booking.pickupDate - currentDate) / 3600

if (hoursUntilPickup >= 48) {
  // Free cancellation
  refundPercentage = 100
  cancellationFee = 0
} else if (hoursUntilPickup >= 24) {
  // Partial refund
  refundPercentage = 50
  cancellationFee = booking.totalCost * 0.10
} else {
  // No refund
  refundPercentage = 0
  cancellationFee = booking.totalCost
}

refundAmount = (booking.totalCost * refundPercentage / 100) - cancellationFee
return Math.max(0, refundAmount)
```

### Cancellation Processing
```
1. Validate cancellation request
2. Check user authorization
3. Verify booking is cancellable
4. Calculate refund amount
5. Begin database transaction
6. Update booking status to 'cancelled'
7. Create cancellation record
8. Release vehicle allocation
9. Update vehicle availability
10. Initiate refund transaction
11. Commit transaction
12. Send notifications
13. Generate rebooking suggestions
```

### Refund Processing
- Use payment gateway refund API
- Queue refund for processing
- Track refund status
- Retry failed refunds (max 3 attempts)
- Send refund confirmation email
- Update refund status in database

## Authentication & Authorization

- JWT Bearer token required
- User must be booking owner or admin
- All cancellations logged with user ID
- IP address and user agent tracked

## Error Handling

**400 Bad Request**: Invalid request data
**401 Unauthorized**: Missing/invalid token
**403 Forbidden**: Not authorized to cancel
**404 Not Found**: Booking not found
**409 Conflict**: Booking cannot be cancelled (wrong status)
**422 Unprocessable Entity**: Business rule violation
**500 Internal Server Error**: Refund processing failed

## Technology Stack

- **Framework**: .NET 8+ with C#
- **API**: ASP.NET Core Web API
- **ORM**: Entity Framework Core
- **Database**: MySQL 8.0+
- **Payment**: Stripe or PayPal SDK
- **Email**: SendGrid or AWS SES

## Implementation Notes

### Performance
- Cache cancellation policies
- Optimize refund calculations
- Use async/await for I/O operations
- Implement efficient database queries

### Concurrency
- Use database transactions
- Lock booking during cancellation
- Handle race conditions
- Prevent duplicate cancellations

### Monitoring
- Log all cancellation requests
- Track cancellation rates
- Monitor refund processing
- Alert on high cancellation rates
- Track refund failures
