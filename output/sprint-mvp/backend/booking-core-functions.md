# Feature: Booking Core Functions - Backend

## Overview

This document specifies the backend implementation for the booking core functions, providing the server-side logic, API endpoints, business rules, and data processing capabilities that power the complete booking lifecycle. The backend serves as the authoritative source for booking operations, ensuring data integrity, business rule enforcement, and secure transaction processing.

The backend architecture follows RESTful principles with .NET 8+ and implements comprehensive validation, error handling, and audit logging to support reliable booking operations at scale.

## Sprint Category

sprint-mvp

## Feature IDs

F-FUNC-BM-001, F-FUNC-BM-004, F-FUNC-BM-006, F-FUNC-BM-007, F-FUNC-BM-008, F-FUNC-BM-009, F-FUNC-BM-010

## Backend Architecture

### Service Layer Components

#### BookingService
Core service handling all booking operations including creation, modification, cancellation, and retrieval.

**Key Responsibilities:**
- Booking creation with validation
- Booking modification processing
- Booking cancellation with refund calculation
- Booking retrieval and filtering
- Business rule enforcement
- Audit trail logging

#### BookingValidationService
Dedicated service for validating booking parameters against business rules.

**Key Responsibilities:**
- Date and time validation
- Customer eligibility validation (age, license)
- Vehicle availability verification
- Location operating hours validation
- Pricing calculation validation
- Discount code validation

#### BookingPricingService
Service for calculating booking costs with all components.

**Key Responsibilities:**
- Base rate calculation based on duration
- Insurance cost calculation
- Additional services pricing
- Equipment rental pricing
- Tax calculation
- Fee calculation
- Discount application
- Total cost computation

#### BookingAvailabilityService
Service managing vehicle availability and preventing overbooking.

**Key Responsibilities:**
- Real-time availability checking
- Temporary vehicle locking during checkout
- Availability calendar updates
- Conflict detection
- Lock expiration management

#### BookingNotificationService
Service handling all booking-related notifications.

**Key Responsibilities:**
- Confirmation email generation and sending
- SMS notification sending
- Modification notification
- Cancellation notification
- QR code generation
- Digital wallet pass creation

#### BookingAuditService
Service maintaining immutable audit trail of all booking operations.

**Key Responsibilities:**
- Event logging for all operations
- Actor tracking (user, admin, system)
- Before/after state capture
- Compliance reporting
- Audit trail querying

### API Controllers

#### BookingsController
Main REST API controller exposing booking endpoints.

**Endpoints:**
- POST /api/bookings - Create booking
- GET /api/bookings/{id} - Get booking details
- GET /api/bookings/user/{userId} - Get user bookings
- PUT /api/bookings/{id} - Modify booking
- POST /api/bookings/{id}/cancel - Cancel booking
- POST /api/bookings/{id}/extend - Extend rental
- POST /api/bookings/validate - Validate booking parameters
- GET /api/bookings/{id}/history - Get modification history

### Data Access Layer

#### BookingRepository
Repository pattern implementation for booking data access.

**Methods:**
- CreateAsync(Booking booking)
- GetByIdAsync(string bookingId)
- GetByReferenceAsync(string bookingReference)
- GetByUserIdAsync(string userId, BookingFilter filter)
- UpdateAsync(Booking booking)
- DeleteAsync(string bookingId)
- GetAvailabilityAsync(string vehicleId, DateTime start, DateTime end)

#### BookingModificationRepository
Repository for booking modification records.

**Methods:**
- CreateAsync(BookingModification modification)
- GetByBookingIdAsync(string bookingId)
- GetHistoryAsync(string bookingId)

#### BookingCancellationRepository
Repository for booking cancellation records.

**Methods:**
- CreateAsync(BookingCancellation cancellation)
- GetByBookingIdAsync(string bookingId)
- UpdateRefundStatusAsync(string cancellationId, RefundStatus status)

#### BookingAuditRepository
Repository for audit log entries.

**Methods:**
- CreateAsync(BookingAuditEntry entry)
- GetByBookingIdAsync(string bookingId)
- QueryAsync(AuditQueryFilter filter)

## API Endpoint Specifications

### POST /api/bookings

**Purpose:** Create a new booking reservation

**Authentication:** Optional (supports guest checkout)

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer {token} (optional)
```

**Request Body:**
```json
{
  "vehicleId": "string",
  "pickupDate": "2026-03-01T10:00:00Z",
  "returnDate": "2026-03-05T10:00:00Z",
  "pickupLocationId": "string",
  "returnLocationId": "string",
  "customerId": "string",
  "customerInfo": {
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "dateOfBirth": "1990-01-01",
    "driverLicense": {
      "number": "string",
      "expirationDate": "2028-01-01",
      "issuingCountry": "US"
    }
  },
  "additionalDrivers": [],
  "insurance": {
    "type": "standard",
    "coverageAmount": 50000
  },
  "additionalServices": ["GPS", "CHILD_SEAT"],
  "equipment": [],
  "paymentMethod": {
    "type": "credit_card",
    "token": "string"
  },
  "discountCode": "SUMMER2026",
  "termsAccepted": true,
  "termsVersion": "1.0"
}
```

**Response (201 Created):**
```json
{
  "bookingId": "string",
  "bookingReference": "BK260301-A7K9",
  "status": "confirmed",
  "vehicle": { },
  "rentalPeriod": { },
  "locations": { },
  "customer": { },
  "pricing": {
    "baseRate": 200.00,
    "insurance": 50.00,
    "services": 30.00,
    "equipment": 0.00,
    "taxes": 28.00,
    "fees": 10.00,
    "discounts": -20.00,
    "total": 298.00,
    "currency": "USD"
  },
  "payment": {
    "method": "credit_card",
    "status": "authorized",
    "transactionId": "string"
  },
  "createdAt": "2026-02-23T10:00:00Z",
  "confirmationSent": true,
  "qrCode": "base64_encoded_string"
}
```

**Error Responses:**
- 400 Bad Request: Validation errors
- 409 Conflict: Vehicle unavailable
- 402 Payment Required: Payment authorization failed
- 500 Internal Server Error: System error

**Business Logic:**
1. Validate all input parameters
2. Check customer age eligibility
3. Verify driver's license validity
4. Check vehicle availability
5. Verify location operating hours
6. Calculate total pricing
7. Validate and apply discount code
8. Process payment authorization
9. Perform final availability check
10. Generate booking reference
11. Create booking record
12. Update availability calendar
13. Send confirmation notifications
14. Log audit event
15. Return booking confirmation

### GET /api/bookings/{id}

**Purpose:** Retrieve booking details by ID

**Authentication:** Required

**Authorization:** User can only access own bookings; Admin can access any

**Path Parameters:**
- id: Booking ID (UUID)

**Response (200 OK):**
```json
{
  "bookingId": "string",
  "bookingReference": "string",
  "status": "confirmed",
  "vehicle": { },
  "rentalPeriod": { },
  "locations": { },
  "customer": { },
  "pricing": { },
  "payment": { },
  "additionalServices": [],
  "equipment": [],
  "createdAt": "2026-02-23T10:00:00Z",
  "updatedAt": "2026-02-23T10:00:00Z"
}
```

**Error Responses:**
- 401 Unauthorized: Not authenticated
- 403 Forbidden: Not authorized to access this booking
- 404 Not Found: Booking not found

### GET /api/bookings/user/{userId}

**Purpose:** Retrieve all bookings for a user

**Authentication:** Required

**Authorization:** User can only access own bookings; Admin can access any

**Path Parameters:**
- userId: User ID (UUID)

**Query Parameters:**
- status: Filter by status (optional)
- fromDate: Filter by pickup date >= (optional)
- toDate: Filter by pickup date <= (optional)
- page: Page number (default: 1)
- pageSize: Items per page (default: 20, max: 100)
- sortBy: Sort field (default: createdAt)
- sortOrder: asc or desc (default: desc)

**Response (200 OK):**
```json
{
  "bookings": [
    {
      "bookingId": "string",
      "bookingReference": "string",
      "status": "confirmed",
      "vehicle": {
        "make": "string",
        "model": "string",
        "imageUrl": "string"
      },
      "rentalPeriod": {
        "pickupDate": "2026-03-01T10:00:00Z",
        "returnDate": "2026-03-05T10:00:00Z"
      },
      "totalCost": 298.00,
      "currency": "USD",
      "createdAt": "2026-02-23T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 45,
    "totalPages": 3
  }
}
```

### PUT /api/bookings/{id}

**Purpose:** Modify an existing booking

**Authentication:** Required

**Authorization:** User can only modify own bookings

**Path Parameters:**
- id: Booking ID (UUID)

**Request Body:**
```json
{
  "modifications": {
    "pickupDate": "2026-03-02T10:00:00Z",
    "returnDate": "2026-03-06T10:00:00Z",
    "vehicleId": "new_vehicle_id",
    "insurance": {
      "type": "premium"
    },
    "additionalServices": ["GPS", "CHILD_SEAT", "ADDITIONAL_DRIVER"]
  },
  "reason": "Travel plans changed"
}
```

**Response (200 OK):**
```json
{
  "bookingId": "string",
  "bookingReference": "string",
  "status": "confirmed",
  "modifications": {
    "before": { },
    "after": { }
  },
  "priceDifference": 50.00,
  "modificationFee": 10.00,
  "newTotal": 358.00,
  "paymentAdjustment": {
    "status": "processed",
    "transactionId": "string"
  },
  "modifiedAt": "2026-02-23T11:00:00Z"
}
```

**Error Responses:**
- 400 Bad Request: Invalid modification or outside time window
- 404 Not Found: Booking not found
- 409 Conflict: New dates/vehicle unavailable
- 402 Payment Required: Payment adjustment failed

**Business Logic:**
1. Retrieve existing booking
2. Verify booking is modifiable
3. Check modification time window
4. Validate requested changes
5. Check availability for new dates/vehicle
6. Calculate price difference
7. Apply modification fee if applicable
8. Process payment adjustment
9. Update booking record
10. Update availability calendars
11. Create modification history entry
12. Send modification confirmation
13. Log audit event

### POST /api/bookings/{id}/cancel

**Purpose:** Cancel a booking

**Authentication:** Required

**Authorization:** User can only cancel own bookings

**Path Parameters:**
- id: Booking ID (UUID)

**Request Body:**
```json
{
  "reason": "Plans changed",
  "reasonCategory": "plans_changed"
}
```

**Response (200 OK):**
```json
{
  "bookingId": "string",
  "status": "cancelled",
  "cancellationPolicy": {
    "type": "partial",
    "refundPercentage": 50.00
  },
  "refund": {
    "amount": 149.00,
    "currency": "USD",
    "processingTime": "5-10 business days",
    "method": "credit_card"
  },
  "cancellationFee": 149.00,
  "cancelledAt": "2026-02-23T12:00:00Z",
  "confirmationSent": true
}
```

**Error Responses:**
- 400 Bad Request: Booking not cancellable
- 404 Not Found: Booking not found

**Business Logic:**
1. Retrieve existing booking
2. Verify booking is cancellable
3. Determine cancellation policy based on timing
4. Calculate refund amount and fee
5. Process refund to original payment method
6. Update booking status to cancelled
7. Release vehicle availability
8. Create cancellation record
9. Send cancellation confirmation
10. Log audit event

### POST /api/bookings/{id}/extend

**Purpose:** Extend an active rental

**Authentication:** Required

**Authorization:** User can only extend own bookings

**Path Parameters:**
- id: Booking ID (UUID)

**Request Body:**
```json
{
  "newReturnDate": "2026-03-07T10:00:00Z"
}
```

**Response (200 OK):**
```json
{
  "bookingId": "string",
  "bookingReference": "string",
  "originalReturnDate": "2026-03-05T10:00:00Z",
  "newReturnDate": "2026-03-07T10:00:00Z",
  "additionalCost": 100.00,
  "newTotal": 398.00,
  "payment": {
    "status": "processed",
    "transactionId": "string"
  },
  "extendedAt": "2026-03-04T15:00:00Z"
}
```

**Error Responses:**
- 400 Bad Request: Booking not active or extension invalid
- 404 Not Found: Booking not found
- 409 Conflict: Vehicle unavailable for extension period
- 402 Payment Required: Payment failed

**Business Logic:**
1. Retrieve existing booking
2. Verify booking is active
3. Check vehicle availability for extension period
4. Calculate additional cost
5. Process payment for extension
6. Update booking return date
7. Update availability calendar
8. Send extension confirmation
9. Log audit event

### POST /api/bookings/validate

**Purpose:** Validate booking parameters before creation

**Authentication:** Optional

**Request Body:**
```json
{
  "vehicleId": "string",
  "pickupDate": "2026-03-01T10:00:00Z",
  "returnDate": "2026-03-05T10:00:00Z",
  "pickupLocationId": "string",
  "returnLocationId": "string",
  "customerInfo": {
    "dateOfBirth": "1990-01-01",
    "driverLicense": {
      "expirationDate": "2028-01-01"
    }
  }
}
```

**Response (200 OK):**
```json
{
  "valid": true,
  "errors": [],
  "warnings": [
    "Pickup location closes at 6 PM on selected date"
  ],
  "availability": {
    "available": true,
    "vehicleId": "string"
  },
  "pricing": {
    "estimatedTotal": 298.00,
    "currency": "USD"
  }
}
```

**Response (200 OK with errors):**
```json
{
  "valid": false,
  "errors": [
    {
      "field": "customerInfo.dateOfBirth",
      "message": "Customer must be at least 21 years old",
      "code": "AGE_REQUIREMENT_NOT_MET"
    },
    {
      "field": "vehicleId",
      "message": "Vehicle not available for selected dates",
      "code": "VEHICLE_UNAVAILABLE"
    }
  ],
  "warnings": []
}
```

### GET /api/bookings/{id}/history

**Purpose:** Retrieve modification history for a booking

**Authentication:** Required

**Authorization:** User can only access own bookings; Admin can access any

**Path Parameters:**
- id: Booking ID (UUID)

**Response (200 OK):**
```json
{
  "bookingId": "string",
  "bookingReference": "string",
  "history": [
    {
      "modificationId": "string",
      "modificationType": "dates",
      "modifiedBy": "user_id",
      "modifiedAt": "2026-02-24T10:00:00Z",
      "before": {
        "pickupDate": "2026-03-01T10:00:00Z",
        "returnDate": "2026-03-05T10:00:00Z"
      },
      "after": {
        "pickupDate": "2026-03-02T10:00:00Z",
        "returnDate": "2026-03-06T10:00:00Z"
      },
      "priceDifference": 50.00,
      "reason": "Travel plans changed"
    }
  ]
}
```

## Business Rules Implementation

### Booking Creation Rules

```csharp
public class BookingCreationRules
{
    public const int MinimumAgeYears = 21;
    public const int MinimumRentalHours = 1;
    public const int MaximumRentalDays = 30;
    public const int VehicleLockMinutes = 15;
    
    public static ValidationResult ValidateBookingRequest(CreateBookingRequest request)
    {
        var errors = new List<ValidationError>();
        
        // Validate dates
        if (request.PickupDate <= DateTime.UtcNow)
            errors.Add(new ValidationError("pickupDate", "Pickup date must be in the future"));
            
        if (request.ReturnDate <= request.PickupDate)
            errors.Add(new ValidationError("returnDate", "Return date must be after pickup date"));
            
        var duration = request.ReturnDate - request.PickupDate;
        if (duration.TotalHours < MinimumRentalHours)
            errors.Add(new ValidationError("returnDate", $"Minimum rental duration is {MinimumRentalHours} hour(s)"));
            
        if (duration.TotalDays > MaximumRentalDays)
            errors.Add(new ValidationError("returnDate", $"Maximum rental duration is {MaximumRentalDays} days"));
        
        // Validate customer age
        var age = CalculateAge(request.CustomerInfo.DateOfBirth);
        if (age < MinimumAgeYears)
            errors.Add(new ValidationError("customerInfo.dateOfBirth", $"Customer must be at least {MinimumAgeYears} years old"));
        
        // Validate driver's license
        if (request.CustomerInfo.DriverLicense.ExpirationDate <= request.ReturnDate)
            errors.Add(new ValidationError("customerInfo.driverLicense.expirationDate", "Driver's license must be valid through rental period"));
        
        // Validate email format
        if (!IsValidEmail(request.CustomerInfo.Email))
            errors.Add(new ValidationError("customerInfo.email", "Invalid email format"));
        
        // Validate phone format
        if (!IsValidPhone(request.CustomerInfo.Phone))
            errors.Add(new ValidationError("customerInfo.phone", "Invalid phone format"));
        
        // Validate terms acceptance
        if (!request.TermsAccepted)
            errors.Add(new ValidationError("termsAccepted", "Terms and conditions must be accepted"));
        
        return new ValidationResult 
        { 
            IsValid = errors.Count == 0, 
            Errors = errors 
        };
    }
    
    private static int CalculateAge(DateTime dateOfBirth)
    {
        var today = DateTime.Today;
        var age = today.Year - dateOfBirth.Year;
        if (dateOfBirth.Date > today.AddYears(-age)) age--;
        return age;
    }
}
```

### Cancellation Policy Rules

```csharp
public class CancellationPolicyRules
{
    public static CancellationPolicy DetermineCancellationPolicy(DateTime pickupDate, DateTime cancellationDate)
    {
        var hoursUntilPickup = (pickupDate - cancellationDate).TotalHours;
        
        if (hoursUntilPickup >= 48)
        {
            return new CancellationPolicy
            {
                Type = CancellationPolicyType.Free,
                RefundPercentage = 100.00m,
                CancellationFee = 0.00m
            };
        }
        else if (hoursUntilPickup >= 24)
        {
            return new CancellationPolicy
            {
                Type = CancellationPolicyType.Partial,
                RefundPercentage = 75.00m,
                CancellationFee = 0.25m // 25% of total
            };
        }
        else if (hoursUntilPickup >= 12)
        {
            return new CancellationPolicy
            {
                Type = CancellationPolicyType.Partial,
                RefundPercentage = 50.00m,
                CancellationFee = 0.50m // 50% of total
            };
        }
        else
        {
            return new CancellationPolicy
            {
                Type = CancellationPolicyType.NoRefund,
                RefundPercentage = 0.00m,
                CancellationFee = 1.00m // 100% of total
            };
        }
    }
    
    public static decimal CalculateRefundAmount(decimal totalCost, CancellationPolicy policy)
    {
        return totalCost * (policy.RefundPercentage / 100.00m);
    }
}
```

### Pricing Calculation Rules

```csharp
public class PricingCalculationRules
{
    public static BookingPricing CalculateTotalPricing(
        Vehicle vehicle,
        DateTime pickupDate,
        DateTime returnDate,
        InsuranceType insurance,
        List<AdditionalService> services,
        List<Equipment> equipment,
        string discountCode = null)
    {
        var duration = returnDate - pickupDate;
        var days = Math.Ceiling(duration.TotalDays);
        
        // Calculate base rate
        var baseRate = vehicle.DailyRate * (decimal)days;
        
        // Apply volume discount
        if (days >= 7)
            baseRate *= 0.85m; // 15% discount for 7+ days
        else if (days >= 3)
            baseRate *= 0.90m; // 10% discount for 3-6 days
        
        // Calculate insurance cost
        var insuranceCost = CalculateInsuranceCost(insurance, days);
        
        // Calculate services cost
        var servicesCost = services.Sum(s => s.DailyRate * (decimal)days);
        
        // Calculate equipment cost
        var equipmentCost = equipment.Sum(e => e.DailyRate * (decimal)days);
        
        // Calculate subtotal
        var subtotal = baseRate + insuranceCost + servicesCost + equipmentCost;
        
        // Calculate taxes (10%)
        var taxes = subtotal * 0.10m;
        
        // Calculate fees
        var fees = 10.00m; // Flat booking fee
        
        // Apply discount
        var discounts = 0.00m;
        if (!string.IsNullOrEmpty(discountCode))
        {
            var discount = ValidateAndGetDiscount(discountCode, subtotal);
            if (discount != null)
                discounts = discount.Amount;
        }
        
        // Calculate total
        var total = subtotal + taxes + fees - discounts;
        
        return new BookingPricing
        {
            BaseRate = baseRate,
            Insurance = insuranceCost,
            Services = servicesCost,
            Equipment = equipmentCost,
            Taxes = taxes,
            Fees = fees,
            Discounts = discounts,
            Total = total,
            Currency = "USD"
        };
    }
}
```

## Error Handling Strategy

### Exception Types

```csharp
public class BookingNotFoundException : Exception
{
    public string BookingId { get; }
    
    public BookingNotFoundException(string bookingId)
        : base($"Booking with ID '{bookingId}' not found")
    {
        BookingId = bookingId;
    }
}

public class VehicleUnavailableException : Exception
{
    public string VehicleId { get; }
    public DateTime PickupDate { get; }
    public DateTime ReturnDate { get; }
    
    public VehicleUnavailableException(string vehicleId, DateTime pickupDate, DateTime returnDate)
        : base($"Vehicle '{vehicleId}' is not available from {pickupDate} to {returnDate}")
    {
        VehicleId = vehicleId;
        PickupDate = pickupDate;
        ReturnDate = returnDate;
    }
}

public class PaymentAuthorizationException : Exception
{
    public string TransactionId { get; }
    public string Reason { get; }
    
    public PaymentAuthorizationException(string transactionId, string reason)
        : base($"Payment authorization failed: {reason}")
    {
        TransactionId = transactionId;
        Reason = reason;
    }
}

public class BookingValidationException : Exception
{
    public List<ValidationError> Errors { get; }
    
    public BookingValidationException(List<ValidationError> errors)
        : base("Booking validation failed")
    {
        Errors = errors;
    }
}
```

### Global Exception Handler

```csharp
public class BookingExceptionHandler : IExceptionHandler
{
    public async Task<IActionResult> HandleExceptionAsync(Exception exception, HttpContext context)
    {
        return exception switch
        {
            BookingNotFoundException ex => new NotFoundObjectResult(new
            {
                error = "BOOKING_NOT_FOUND",
                message = ex.Message,
                bookingId = ex.BookingId
            }),
            
            VehicleUnavailableException ex => new ConflictObjectResult(new
            {
                error = "VEHICLE_UNAVAILABLE",
                message = ex.Message,
                vehicleId = ex.VehicleId,
                pickupDate = ex.PickupDate,
                returnDate = ex.ReturnDate
            }),
            
            PaymentAuthorizationException ex => new ObjectResult(new
            {
                error = "PAYMENT_AUTHORIZATION_FAILED",
                message = ex.Message,
                transactionId = ex.TransactionId,
                reason = ex.Reason
            })
            {
                StatusCode = 402
            },
            
            BookingValidationException ex => new BadRequestObjectResult(new
            {
                error = "VALIDATION_FAILED",
                message = "One or more validation errors occurred",
                errors = ex.Errors
            }),
            
            _ => new ObjectResult(new
            {
                error = "INTERNAL_SERVER_ERROR",
                message = "An unexpected error occurred"
            })
            {
                StatusCode = 500
            }
        };
    }
}
```

## Performance Optimization

### Caching Strategy
- Cache vehicle availability calendars (5-minute TTL)
- Cache pricing rules and rate tables (1-hour TTL)
- Cache location operating hours (1-day TTL)
- Use Redis for temporary vehicle locks

### Database Optimization
- Use indexes for common queries
- Implement pagination for large result sets
- Use database transactions for atomic operations
- Optimize availability queries with date range indexes

### Async Operations
- Send notifications asynchronously using message queue
- Process refunds asynchronously
- Generate QR codes and wallet passes asynchronously
- Update analytics asynchronously

## Security Considerations

### Authentication and Authorization
- Require JWT token for authenticated endpoints
- Validate token signature and expiration
- Implement role-based access control
- Prevent unauthorized access to other users' bookings

### Data Protection
- Encrypt sensitive data at rest (payment info, license numbers)
- Use TLS 1.3 for all API communications
- Implement rate limiting to prevent abuse
- Sanitize all user inputs to prevent injection attacks

### Payment Security
- Use payment gateway tokenization
- Never store raw credit card numbers
- Implement 3D Secure for fraud prevention
- Log all payment transactions for audit

### Audit Trail
- Log all booking operations immutably
- Include actor information (user, IP, user agent)
- Store before/after states for modifications
- Retain logs for compliance requirements

## Testing Strategy

### Unit Tests
- Test all business rule validations
- Test pricing calculations
- Test cancellation policy logic
- Test availability checking
- Test booking reference generation

### Integration Tests
- Test payment gateway integration
- Test email/SMS notification sending
- Test database transactions
- Test availability locking mechanism

### Performance Tests
- Load test booking creation under concurrent requests
- Test availability checking performance
- Test database query performance
- Test API response times

### Property-Based Tests
- Test booking validation rules hold for all inputs
- Test pricing calculations are consistent
- Test cancellation refunds are correct
- Test availability checking prevents overbooking

## Monitoring and Logging

### Key Metrics
- Booking creation rate
- Booking completion rate
- Payment success rate
- Modification rate
- Cancellation rate
- Average booking creation time
- API response times
- Error rates by endpoint

### Logging
- Log all API requests and responses
- Log all business rule violations
- Log all payment transactions
- Log all errors with stack traces
- Log performance metrics

### Alerting
- Alert on high error rates
- Alert on payment gateway failures
- Alert on database connection issues
- Alert on slow API response times
- Alert on availability conflicts

## Technology Stack

- Backend Framework: .NET 8+ with C#
- Web API: ASP.NET Core Web API
- ORM: Entity Framework Core
- Database: MySQL 8.0+
- Caching: Redis
- Message Queue: RabbitMQ or Azure Service Bus
- Payment Gateway: Stripe, PayPal, or similar
- Email Service: SendGrid
- SMS Service: Twilio
- Logging: Serilog
- Monitoring: Application Insights or similar

## Implementation Priority

1. Booking creation endpoint with validation
2. Booking retrieval endpoints
3. Payment gateway integration
4. Availability checking and locking
5. Pricing calculation service
6. Notification service (email/SMS)
7. Booking modification endpoint
8. Booking cancellation endpoint
9. Audit logging service
10. Performance optimization and caching
