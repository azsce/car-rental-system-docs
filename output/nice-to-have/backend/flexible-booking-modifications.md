# Feature: Flexible Booking Modifications (Backend)

## Overview

Backend services for self-service booking modifications including date/time changes, location changes, vehicle changes, and additional services management. Provides automatic repricing, availability validation, payment processing, and modification history tracking.

## Sprint Category

nice-to-have

## Feature ID

F-BM-008

## API Endpoints

### GET /api/bookings/{bookingId}/modification-options

Retrieve available modification options and restrictions for a specific booking.

**Authentication**: Required (JWT Bearer token)

**Path Parameters:**
- `bookingId` (string, required): Unique booking identifier

**Response**: 200 OK
```json
{
  "bookingId": "BK-2026-001234",
  "allowedModifications": ["dates", "vehicle", "location", "services"],
  "restrictions": {
    "minimumNoticeHours": 24,
    "modificationDeadline": "2026-03-15T10:00:00Z",
    "allowLocationChange": true,
    "allowVehicleChange": true,
    "maxModifications": 3,
    "remainingModifications": 2
  },
  "fees": {
    "dateChangeFee": 25.00,
    "vehicleChangeFee": 50.00,
    "locationChangeFee": 75.00,
    "currency": "USD"
  },
  "policies": {
    "cancellationPolicy": "Free cancellation up to 48 hours before pickup",
    "modificationPolicy": "Modifications allowed up to 24 hours before pickup"
  }
}
```

**Error Responses:**
- 401 Unauthorized: Invalid or missing authentication token
- 403 Forbidden: User not authorized to modify this booking
- 404 Not Found: Booking not found
- 409 Conflict: Booking cannot be modified (already started, completed, or cancelled)

---

### POST /api/bookings/{bookingId}/check-availability

Check availability for proposed booking modifications.

**Authentication**: Required

**Path Parameters:**
- `bookingId` (string, required): Unique booking identifier

**Request Body:**
```json
{
  "newPickupDate": "2026-03-20T10:00:00Z",
  "newReturnDate": "2026-03-25T10:00:00Z",
  "newVehicleId": "VEH-2026-5678",
  "newPickupLocationId": "LOC-NYC-001",
  "newReturnLocationId": "LOC-NYC-001"
}
```

**Response**: 200 OK
```json
{
  "available": true,
  "vehicleAvailable": true,
  "locationAvailable": true,
  "pickupLocationOperating": true,
  "returnLocationOperating": true,
  "alternativeVehicles": [],
  "message": "All requested modifications are available",
  "validationWarnings": []
}
```

**Response**: 200 OK (Unavailable)
```json
{
  "available": false,
  "vehicleAvailable": false,
  "locationAvailable": true,
  "pickupLocationOperating": true,
  "returnLocationOperating": true,
  "alternativeVehicles": [
    {
      "vehicleId": "VEH-2026-5679",
      "make": "Toyota",
      "model": "Camry",
      "category": "Sedan",
      "available": true,
      "pricePerDay": 65.00
    }
  ],
  "message": "Requested vehicle not available for selected dates",
  "validationWarnings": ["Selected vehicle is under maintenance during requested period"]
}
```

---

### POST /api/bookings/{bookingId}/calculate-modification-cost

Calculate the cost impact of proposed modifications.

**Authentication**: Required

**Request Body:**
```json
{
  "dateChanges": {
    "newPickupDate": "2026-03-20T10:00:00Z",
    "newReturnDate": "2026-03-25T10:00:00Z"
  },
  "vehicleChange": {
    "newVehicleId": "VEH-2026-5678"
  },
  "locationChanges": {
    "newPickupLocationId": "LOC-NYC-001",
    "newReturnLocationId": "LOC-BOS-001"
  },
  "serviceChanges": {
    "addServices": ["SRV-GPS-001", "SRV-CHILD-SEAT-001"],
    "removeServices": ["SRV-INSURANCE-BASIC-001"]
  }
}
```

**Response**: 200 OK
```json
{
  "originalCost": 450.00,
  "newCost": 575.00,
  "costDifference": 125.00,
  "breakdown": {
    "baseRateChange": 75.00,
    "serviceChanges": 35.00,
    "modificationFees": 25.00,
    "taxAdjustment": -10.00
  },
  "refundAmount": 0.00,
  "additionalPayment": 125.00,
  "currency": "USD",
  "detailedBreakdown": {
    "original": {
      "baseRate": 400.00,
      "services": 30.00,
      "taxes": 20.00,
      "total": 450.00
    },
    "modified": {
      "baseRate": 475.00,
      "services": 65.00,
      "modificationFee": 25.00,
      "taxes": 10.00,
      "total": 575.00
    }
  }
}
```

---

### PUT /api/bookings/{bookingId}/modify

Apply confirmed modifications to an existing booking.

**Authentication**: Required

**Request Body:**
```json
{
  "modifications": {
    "dates": {
      "pickupDate": "2026-03-20T10:00:00Z",
      "returnDate": "2026-03-25T10:00:00Z"
    },
    "vehicle": {
      "vehicleId": "VEH-2026-5678"
    },
    "locations": {
      "pickupLocationId": "LOC-NYC-001",
      "returnLocationId": "LOC-BOS-001"
    },
    "services": {
      "addedServices": ["SRV-GPS-001", "SRV-CHILD-SEAT-001"],
      "removedServices": ["SRV-INSURANCE-BASIC-001"]
    }
  },
  "paymentMethodId": "PM-CARD-1234",
  "acceptModificationFees": true,
  "reason": "Travel plans changed"
}
```

**Response**: 200 OK
```json
{
  "bookingId": "BK-2026-001234",
  "modificationId": "MOD-2026-5678",
  "status": "modified",
  "updatedBooking": {
    "bookingId": "BK-2026-001234",
    "pickupDate": "2026-03-20T10:00:00Z",
    "returnDate": "2026-03-25T10:00:00Z",
    "vehicleId": "VEH-2026-5678",
    "pickupLocationId": "LOC-NYC-001",
    "returnLocationId": "LOC-BOS-001",
    "services": ["SRV-GPS-001", "SRV-CHILD-SEAT-001"],
    "totalCost": 575.00,
    "modificationCount": 1
  },
  "confirmationEmail": "sent",
  "paymentStatus": "processed",
  "paymentTransactionId": "TXN-2026-9876",
  "message": "Booking successfully modified"
}
```

**Error Responses:**
- 400 Bad Request: Invalid modification request or validation failure
- 402 Payment Required: Payment processing failed
- 409 Conflict: Booking state conflict or availability changed
- 422 Unprocessable Entity: Modification violates business rules

---

### GET /api/bookings/{bookingId}/modification-history

Retrieve complete modification history for a booking.

**Authentication**: Required

**Query Parameters:**
- `limit` (integer, optional): Maximum number of records (default: 50)
- `offset` (integer, optional): Pagination offset (default: 0)

**Response**: 200 OK
```json
{
  "bookingId": "BK-2026-001234",
  "totalModifications": 2,
  "modifications": [
    {
      "modificationId": "MOD-2026-5678",
      "modificationType": "dates",
      "modifiedAt": "2026-02-15T14:30:00Z",
      "modifiedBy": {
        "userId": "USR-2026-1234",
        "name": "John Doe",
        "email": "john.doe@example.com"
      },
      "changes": {
        "original": {
          "pickupDate": "2026-03-15T10:00:00Z",
          "returnDate": "2026-03-18T10:00:00Z"
        },
        "new": {
          "pickupDate": "2026-03-20T10:00:00Z",
          "returnDate": "2026-03-25T10:00:00Z"
        }
      },
      "costImpact": {
        "originalCost": 450.00,
        "newCost": 575.00,
        "difference": 125.00
      },
      "paymentStatus": "processed"
    }
  ]
}
```

## Business Logic

### Modification Validation Rules

**Time-Based Restrictions:**
- Modifications not allowed within 24 hours of pickup time
- Modifications not allowed after trip has started
- Modifications not allowed for completed or cancelled bookings
- Maximum number of modifications per booking (typically 3-5)

**Date Validation:**
- New pickup date must be in the future
- New return date must be after pickup date
- Rental duration must meet minimum requirements (typically 1 hour or 1 day)
- Rental duration must not exceed maximum (typically 30-90 days)
- Dates must fall within location operating hours

**Vehicle Validation:**
- New vehicle must be available for entire modified period
- Vehicle must be in same or higher category if upgrade
- Vehicle must meet customer's driver license requirements
- Vehicle must not be under maintenance during period

**Location Validation:**
- New locations must support requested dates
- Locations must be operating during pickup/return times
- One-way rentals must be supported if locations differ
- Location must have capacity for additional booking

**Service Validation:**
- Services must be compatible with new vehicle
- Services must be available at new locations
- Insurance changes must meet minimum coverage requirements

### Availability Checking Algorithm

```
1. Lock booking for modification (prevent concurrent changes)
2. Query vehicle inventory for new date range
3. Check vehicle maintenance schedule
4. Verify location operating hours
5. Check location capacity
6. Validate service availability
7. Calculate availability score
8. If unavailable, query alternative vehicles
9. Return availability status with alternatives
10. Release booking lock
```

### Cost Calculation Logic

**Base Rate Calculation:**
- Retrieve current pricing rules for new dates
- Calculate daily/hourly rate based on duration
- Apply volume discounts (weekly, monthly rates)
- Consider seasonal pricing adjustments
- Apply dynamic pricing if enabled

**Service Cost Calculation:**
- Calculate cost for added services
- Calculate refund for removed services
- Prorate service costs based on rental duration
- Apply service-specific pricing rules

**Modification Fee Calculation:**
- Apply flat modification fee if configured
- Calculate percentage-based fee if applicable
- Waive fees for premium customers if configured
- Apply supplier-specific fee rules

**Tax Calculation:**
- Recalculate taxes based on new total
- Apply location-specific tax rates
- Consider tax exemptions for corporate bookings
- Calculate tax difference from original booking

**Final Cost Determination:**
```
newTotalCost = newBaseRate + newServicesCost + modificationFee + newTaxes
costDifference = newTotalCost - originalTotalCost
if (costDifference > 0) {
  additionalPayment = costDifference
  refundAmount = 0
} else {
  additionalPayment = 0
  refundAmount = abs(costDifference)
}
```

### Modification Processing Workflow

```
1. Validate modification request
2. Check user authorization
3. Verify booking is modifiable
4. Lock booking and vehicle inventory
5. Perform availability check
6. Calculate cost impact
7. Process payment (charge or refund)
8. Update booking record
9. Update vehicle availability calendar
10. Release old vehicle allocation
11. Allocate new vehicle if changed
12. Update location capacity
13. Generate modification record
14. Send confirmation notifications
15. Update calendar invites
16. Log modification in audit trail
17. Release locks
18. Return success response
```

### Payment Processing

**Additional Payment:**
- Charge payment method on file
- Support alternative payment method if primary fails
- Generate payment transaction record
- Update booking payment status
- Send payment receipt

**Refund Processing:**
- Calculate refund amount
- Initiate refund to original payment method
- Queue refund for processing (typically 5-10 business days)
- Generate refund transaction record
- Send refund confirmation
- Update booking payment status

### Notification Logic

**Email Notifications:**
- Send modification confirmation to customer
- Include updated booking details
- Attach updated booking confirmation PDF
- Provide new QR code for check-in
- Include modification summary

**Supplier Notifications:**
- Notify pickup location of changes
- Notify return location if changed
- Update vehicle allocation
- Provide customer contact information

**Calendar Updates:**
- Update calendar invite with new dates
- Send calendar cancellation for old dates
- Send new calendar invite for modified dates

**Mobile Push Notifications:**
- Send immediate push notification
- Include modification summary
- Provide deep link to updated booking

## Authentication & Authorization

**Authentication Requirements:**
- Valid JWT Bearer token required for all endpoints
- Token must not be expired
- Token must contain valid user ID

**Authorization Rules:**
- User must be the booking owner
- Corporate admins can modify bookings for their organization
- System admins can modify any booking
- Delegates with explicit permission can modify bookings
- Modification actions logged with user ID for audit

**Permission Checks:**
```
if (user.id === booking.userId) {
  allow modification
} else if (user.role === 'admin') {
  allow modification
} else if (user.role === 'corporate_admin' && booking.organizationId === user.organizationId) {
  allow modification
} else if (booking.delegates.includes(user.id)) {
  allow modification
} else {
  deny modification (403 Forbidden)
}
```

## Error Handling

**Validation Errors (400 Bad Request):**
- Invalid date format
- Dates in the past
- Return date before pickup date
- Invalid vehicle ID
- Invalid location ID
- Missing required fields

**Authorization Errors (403 Forbidden):**
- User not authorized to modify booking
- Booking belongs to different user
- Insufficient permissions

**Business Rule Violations (422 Unprocessable Entity):**
- Modification within restricted time window
- Maximum modifications exceeded
- Booking already started/completed/cancelled
- Vehicle unavailable for new dates
- Location not operating during requested times

**Payment Errors (402 Payment Required):**
- Payment method declined
- Insufficient funds
- Payment processing failure
- Invalid payment method

**Conflict Errors (409 Conflict):**
- Booking being modified by another user
- Vehicle availability changed during modification
- Booking state changed (cancelled, started)

**Error Response Format:**
```json
{
  "error": {
    "code": "MODIFICATION_FAILED",
    "message": "Unable to modify booking",
    "details": "Vehicle no longer available for selected dates",
    "field": "newVehicleId",
    "timestamp": "2026-02-23T10:30:00Z"
  }
}
```

## Technology Stack

- **Framework**: .NET 8+ with C#
- **API**: ASP.NET Core Web API
- **ORM**: Entity Framework Core
- **Database**: MySQL 8.0+
- **Authentication**: JWT Bearer tokens with ASP.NET Core Identity
- **Payment Processing**: Stripe or PayPal SDK
- **Email**: SendGrid or AWS SES
- **Caching**: Redis for availability caching
- **Logging**: Serilog with structured logging

## Implementation Notes

### Performance Optimization
- Cache vehicle availability for frequently queried dates
- Use database indexes on booking_id, modified_at, payment_status
- Implement connection pooling for database
- Use async/await for all I/O operations
- Batch notification sending

### Concurrency Handling
- Implement optimistic locking with version numbers
- Use database transactions for modification operations
- Lock booking record during modification
- Handle race conditions gracefully
- Provide clear error messages for conflicts

### Scalability Considerations
- Design for horizontal scaling
- Use message queues for notification processing
- Implement rate limiting on modification endpoints
- Cache pricing rules and policies
- Use read replicas for availability queries

### Security Measures
- Validate all input data
- Sanitize user-provided reason/notes
- Log all modification attempts
- Implement rate limiting to prevent abuse
- Encrypt sensitive data in transit and at rest
- Use parameterized queries to prevent SQL injection

### Monitoring & Logging
- Log all modification requests
- Track modification success/failure rates
- Monitor payment processing failures
- Alert on unusual modification patterns
- Track API response times
- Log business rule violations
