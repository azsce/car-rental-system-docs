# Feature: Booking Workflow Details (Backend)

## Overview

Backend services supporting critical booking workflow steps including vehicle temporary locking, customer information validation, additional driver management, insurance option management, additional services management, pricing calculation, and terms acceptance recording. These services ensure data integrity, business rule enforcement, and seamless integration between frontend and database layers.

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature IDs

- F-WF-BOOK-002: Vehicle Temporary Lock System
- F-WF-BOOK-003: Customer Information Pre-Fill
- F-WF-BOOK-004: Real-Time Form Validation
- F-WF-BOOK-005: Additional Driver Management
- F-WF-BOOK-006: Insurance Coverage Selection
- F-WF-BOOK-007: Additional Services and Equipment Rental (Nice-to-have)
- F-WF-BOOK-008: Booking Summary Review (Nice-to-have)
- F-WF-BOOK-010: Terms and Conditions Acceptance

## Technology Stack

- .NET 8+ with C#
- ASP.NET Core Web API
- Entity Framework Core
- FluentValidation for request validation
- MediatR for CQRS pattern
- Hangfire for background jobs
- MySQL 8.0+ database

## API Services

### VehicleLockService
Manages temporary vehicle reservations during booking process.

**Responsibilities**:
- Create vehicle locks with expiration
- Extend lock duration
- Release locks
- Clean up expired locks
- Prevent double-booking

**Key Methods**:
- CreateLockAsync(vehicleId, pickupDate, returnDate, sessionId)
- ExtendLockAsync(lockId, sessionId)
- ReleaseLockAsync(lockId, sessionId)
- CleanupExpiredLocksAsync()
- CheckVehicleAvailabilityAsync(vehicleId, pickupDate, returnDate)


### CustomerValidationService
Validates customer information in real-time.

**Responsibilities**:
- Validate email format
- Validate phone number format
- Calculate and validate age
- Validate driver's license information
- Enforce business rules

**Key Methods**:
- ValidateEmailAsync(email)
- ValidatePhoneAsync(phone, countryCode)
- ValidateAgeAsync(dateOfBirth, minimumAge)
- ValidateLicenseAsync(licenseNumber, expirationDate, rentalEndDate)
- ValidateCustomerInfoAsync(customerInfo)

**Validation Rules**:
- Email: RFC 5322 compliant format
- Phone: E.164 format with country code
- Age: Minimum 21 years (configurable by vehicle category)
- License: Must be valid through rental end date

### AdditionalDriverService
Manages additional authorized drivers for bookings.

**Responsibilities**:
- Validate driver information
- Calculate driver fees
- Manage driver records
- Enforce driver limits

**Key Methods**:
- ValidateDriverAsync(driverInfo, rentalDates)
- CalculateDriverFeeAsync(rentalDuration)
- AddDriverToBookingAsync(bookingId, driverInfo)
- RemoveDriverFromBookingAsync(driverId)
- GetBookingDriversAsync(bookingId)

**Business Rules**:
- Maximum 4 additional drivers per booking
- Each driver must meet age requirements
- Driver fee calculated based on rental duration
- Duplicate license detection


### InsuranceService
Manages insurance options and selections.

**Responsibilities**:
- Retrieve available insurance options
- Calculate insurance costs
- Manage insurance packages
- Track insurance selections

**Key Methods**:
- GetInsuranceOptionsAsync(vehicleId, rentalDuration)
- GetInsurancePackagesAsync(vehicleId, rentalDuration)
- CalculateInsuranceCostAsync(optionIds, rentalDuration)
- AddInsuranceToBookingAsync(bookingId, insuranceSelections)
- GetBookingInsuranceAsync(bookingId)

**Business Rules**:
- Mandatory insurance automatically included
- Package discounts applied when applicable
- Costs calculated based on rental duration
- Insurance options vary by vehicle category

### AdditionalServicesService
Manages additional services and equipment.

**Responsibilities**:
- Retrieve available services
- Check service availability
- Calculate service costs
- Manage service inventory

**Key Methods**:
- GetAvailableServicesAsync(locationId, pickupDate, returnDate)
- CheckServiceAvailabilityAsync(serviceId, locationId, dates)
- CalculateServiceCostAsync(serviceId, quantity, rentalDuration)
- AddServiceToBookingAsync(bookingId, serviceSelections)
- GetBookingServicesAsync(bookingId)

**Business Rules**:
- Check inventory availability before allowing selection
- Services have either daily rate or flat fee
- Quantity limited by service max_quantity
- Provide alternatives for unavailable services


### PricingCalculationService
Calculates complete booking totals with all selections.

**Responsibilities**:
- Calculate base rental rate
- Sum insurance costs
- Calculate additional driver fees
- Sum service fees
- Calculate taxes
- Apply discounts
- Generate itemized breakdown

**Key Methods**:
- CalculateBaseRateAsync(vehicleId, rentalDuration, locations)
- CalculateTotalAsync(bookingDetails)
- ApplyDiscountAsync(total, discountCode)
- GeneratePricingBreakdownAsync(bookingDetails)
- ValidateDiscountCodeAsync(code, bookingDetails)

**Business Rules**:
- Base rate varies by vehicle, duration, and location
- Taxes calculated based on pickup location
- Airport surcharges applied when applicable
- Discount codes validated for eligibility
- All amounts rounded to 2 decimal places

### TermsAcceptanceService
Records and manages terms and conditions acceptances.

**Responsibilities**:
- Retrieve terms documents
- Record acceptances
- Validate required acceptances
- Maintain audit trail

**Key Methods**:
- GetTermsDocumentsAsync(types)
- RecordAcceptanceAsync(bookingId, acceptances)
- ValidateRequiredAcceptancesAsync(bookingId)
- GetBookingAcceptancesAsync(bookingId)
- GetLatestDocumentVersionAsync(documentType)

**Business Rules**:
- All required documents must be accepted
- Acceptance timestamp and IP recorded
- Document version recorded for audit
- Acceptances cannot be deleted (audit requirement)


## Background Jobs

### ExpiredLockCleanupJob
Scheduled job to clean up expired vehicle locks.

**Schedule**: Every 1 minute

**Responsibilities**:
- Query for expired locks
- Update lock status to 'expired'
- Release vehicle availability
- Log cleanup statistics

**Implementation**:
```
public class ExpiredLockCleanupJob
{
    public async Task ExecuteAsync()
    {
        var expiredLocks = await GetExpiredLocksAsync();
        foreach (var lock in expiredLocks)
        {
            lock.Status = LockStatus.Expired;
            await UpdateLockAsync(lock);
        }
        await LogCleanupStatisticsAsync(expiredLocks.Count);
    }
}
```

## Error Handling

### Vehicle Lock Errors
- Lock creation fails if vehicle unavailable: Return 409 Conflict
- Lock extension fails if limit reached: Return 400 Bad Request
- Lock not found: Return 404 Not Found
- Lock belongs to different session: Return 403 Forbidden

### Validation Errors
- Invalid email format: Return 400 with specific error message
- Age below minimum: Return 400 with age requirement
- Expired license: Return 400 with expiration date issue
- Missing required fields: Return 400 with field list

### Service Availability Errors
- Service unavailable: Return 409 Conflict with alternatives
- Insufficient inventory: Return 409 with available quantity
- Service not found: Return 404 Not Found

### Pricing Errors
- Invalid discount code: Return 400 with reason
- Discount not applicable: Return 400 with eligibility requirements
- Pricing calculation error: Return 500 with error ID for support


## Security Considerations

### Authentication
- All endpoints require valid JWT token or session
- Guest bookings use session-based authentication
- Session timeout extended during active checkout
- Rate limiting on validation endpoints (10 requests per minute per IP)

### Data Protection
- Sensitive data encrypted at rest
- PII logged only when necessary
- IP addresses hashed for privacy
- License numbers partially masked in logs

### Input Validation
- All inputs validated and sanitized
- SQL injection prevention via parameterized queries
- XSS prevention via input encoding
- CSRF protection on state-changing operations

### Audit Trail
- All terms acceptances logged with timestamp and IP
- Lock creation and expiration logged
- Pricing calculations logged for dispute resolution
- Failed validation attempts logged for fraud detection

## Performance Optimization

### Caching Strategy
- Insurance options cached for 1 hour
- Service availability cached for 5 minutes
- Terms documents cached for 24 hours
- Validation rules cached for 1 hour

### Database Optimization
- Indexes on frequently queried fields
- Connection pooling for database access
- Batch operations for multiple drivers/services
- Async operations for all I/O

### API Optimization
- Response compression enabled
- Pagination for list endpoints
- Partial responses for large objects
- ETags for conditional requests


## Monitoring and Logging

### Key Metrics
- Lock creation rate
- Lock expiration rate
- Lock extension rate
- Validation error rate by field
- Insurance selection rate by option
- Service selection rate by service
- Discount code usage rate
- API response times
- Error rates by endpoint

### Logging
- Structured logging with Serilog
- Log levels: Debug, Information, Warning, Error, Critical
- Correlation IDs for request tracking
- Performance logging for slow operations (>1 second)
- Error logging with stack traces
- Audit logging for sensitive operations

### Alerts
- High lock expiration rate (>20%)
- High validation error rate (>15%)
- API response time >2 seconds
- Error rate >5%
- Database connection failures
- Background job failures

## Testing Strategy

### Unit Tests
- Validation logic for all fields
- Pricing calculation accuracy
- Business rule enforcement
- Error handling scenarios

### Integration Tests
- API endpoint functionality
- Database operations
- Background job execution
- External service integration

### Performance Tests
- Concurrent lock creation
- High-volume validation requests
- Pricing calculation under load
- Database query performance

