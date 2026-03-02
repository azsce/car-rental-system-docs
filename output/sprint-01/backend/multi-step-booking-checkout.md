# Feature: Multi-Step Booking Checkout (Backend)

## Overview

Backend services and APIs supporting the multi-step booking checkout workflow. Provides vehicle availability management, customer validation, pricing calculation, payment processing, and booking creation with comprehensive error handling and transaction management.

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature IDs

- F-BM-001: Multi-Step Checkout Process
- F-WF-BOOK-001: Multi-Step Booking Checkout

## Backend Specifications

### API Endpoints

Refer to the frontend documentation for complete API endpoint specifications including:
- Vehicle availability checking with temporary locks
- Customer information validation
- Real-time pricing calculation
- Insurance options retrieval
- Additional services availability
- Promotional code validation
- Payment processing
- Booking creation and confirmation

### Core Services

#### VehicleAvailabilityService
Manages vehicle availability checking and temporary locking.

**Responsibilities:**
- Check vehicle availability for date range
- Create temporary vehicle locks (5-15 minutes)
- Extend locks as user progresses
- Release locks on completion or timeout
- Prevent double-booking through lock validation

**Key Methods:**
- `CheckAvailability(vehicleId, pickupDate, returnDate, locationId)`
- `CreateLock(vehicleId, dates, sessionId)`
- `ExtendLock(lockToken)`
- `ReleaseLock(lockToken)`
- `CleanupExpiredLocks()`


#### CustomerValidationService
Validates customer information and verifies eligibility.

**Responsibilities:**
- Validate customer personal information
- Verify age requirements (minimum 21 years)
- Validate driver's license information
- Check license expiration dates
- Apply young driver surcharges (age 21-24)
- Validate additional driver information

**Key Methods:**
- `ValidateCustomerInfo(customerData)`
- `VerifyAge(dateOfBirth, rentalDate)`
- `ValidateLicense(licenseNumber, expirationDate, rentalEndDate)`
- `CalculateYoungDriverSurcharge(age, rentalDuration)`

#### PricingCalculationService
Calculates booking costs with all components.

**Responsibilities:**
- Calculate base rental rate based on vehicle and duration
- Apply time-based discounts (weekly, monthly)
- Calculate insurance costs
- Calculate additional driver fees
- Calculate service fees
- Apply taxes based on location
- Apply airport surcharges
- Apply promotional discounts
- Generate itemized pricing breakdown

**Key Methods:**
- `CalculateBaseRate(vehicleId, pickupDate, returnDate)`
- `CalculateInsuranceCost(insuranceSelections, duration)`
- `CalculateDriverFees(numberOfDrivers, duration)`
- `CalculateServiceFees(services, duration)`
- `CalculateTaxes(subtotal, locationId)`
- `ApplyDiscount(total, promoCode)`
- `GeneratePricingBreakdown(bookingDetails)`


#### PaymentProcessingService
Handles payment gateway integration and transaction management.

**Responsibilities:**
- Tokenize payment card details
- Authorize payment amounts
- Implement 3D Secure authentication
- Capture payments on booking confirmation
- Handle payment gateway responses
- Implement retry logic for transient failures
- Process refunds for cancellations
- Maintain PCI DSS compliance

**Key Methods:**
- `TokenizeCard(cardDetails)`
- `AuthorizePayment(amount, paymentToken, bookingDetails)`
- `CapturePayment(authorizationCode, amount)`
- `ProcessRefund(transactionId, amount)`
- `HandlePaymentWebhook(webhookData)`

#### BookingCreationService
Creates and manages booking records.

**Responsibilities:**
- Validate all booking information
- Perform final availability check
- Create booking with unique reference number
- Store complete booking details
- Update vehicle availability
- Generate confirmation materials
- Send notifications (email, SMS)
- Process loyalty points
- Create audit trail

**Key Methods:**
- `CreateBooking(bookingData, paymentConfirmation)`
- `GenerateReferenceNumber()`
- `StoreBookingDetails(booking)`
- `UpdateVehicleAvailability(vehicleId, dates)`
- `SendConfirmations(booking)`
- `ProcessLoyaltyPoints(customerId, bookingAmount)`


#### PromotionalCodeService
Manages discount code validation and application.

**Responsibilities:**
- Validate promotional codes
- Check code expiration and usage limits
- Verify code eligibility criteria
- Calculate discount amounts
- Track code usage
- Prevent unauthorized code stacking

**Key Methods:**
- `ValidateCode(promoCode, bookingDetails)`
- `CalculateDiscount(code, bookingAmount)`
- `RecordCodeUsage(code, bookingId)`
- `CheckEligibility(code, customer, vehicle, dates)`

#### NotificationService
Sends booking confirmations and updates.

**Responsibilities:**
- Send confirmation emails
- Send confirmation SMS
- Generate QR codes for check-in
- Create calendar invitations
- Send booking modification notifications
- Send cancellation confirmations
- Handle notification failures with retry

**Key Methods:**
- `SendConfirmationEmail(booking, customer)`
- `SendConfirmationSMS(booking, phoneNumber)`
- `GenerateQRCode(bookingReference)`
- `CreateCalendarInvite(booking)`
- `SendModificationNotification(booking, changes)`

### Business Logic Implementation

#### Transaction Management
All booking creation operations wrapped in database transactions to ensure atomicity:
1. Validate vehicle availability
2. Process payment authorization
3. Create booking record
4. Create related records (customer, drivers, insurance, services, pricing)
5. Update vehicle availability
6. Capture payment
7. Send confirmations

If any step fails, entire transaction rolls back.


#### Idempotency
Implement idempotency for booking creation to prevent duplicate bookings:
- Use idempotency keys in API requests
- Check for existing bookings with same key
- Return existing booking if duplicate request detected
- Store idempotency keys with expiration (24 hours)

#### Rate Limiting
Protect APIs from abuse:
- 10 requests per minute per IP for availability checks
- 5 requests per minute per IP for booking creation
- 3 requests per minute per IP for payment processing
- Exponential backoff for repeated failures

#### Caching Strategy
Cache frequently accessed data:
- Insurance options (1 hour TTL)
- Service availability (30 minutes TTL)
- Vehicle base rates (1 hour TTL)
- Tax rates by location (24 hours TTL)
- Invalidate cache on data updates

#### Error Handling
Comprehensive error handling with specific error codes:
- `VEHICLE_UNAVAILABLE`: Vehicle not available for dates
- `INVALID_CUSTOMER_INFO`: Customer validation failed
- `PAYMENT_DECLINED`: Payment authorization failed
- `LOCK_EXPIRED`: Vehicle lock expired during checkout
- `PROMO_CODE_INVALID`: Promotional code not valid
- `SYSTEM_ERROR`: Internal server error

Return appropriate HTTP status codes:
- 200: Success
- 400: Bad request (validation errors)
- 402: Payment required (payment declined)
- 404: Resource not found
- 409: Conflict (availability issue)
- 429: Too many requests (rate limit)
- 500: Internal server error


### Security Implementation

#### Authentication
- JWT token validation for authenticated endpoints
- Support guest checkout without authentication
- Generate temporary session tokens for guest bookings
- Implement token refresh mechanism
- Validate token expiration

#### Authorization
- Customers can only access their own bookings
- Admin users can access all bookings
- Location managers can access bookings for their locations
- Implement role-based access control (RBAC)

#### Data Protection
- Encrypt sensitive data at rest (license numbers, payment tokens)
- Use TLS 1.3 for data in transit
- Implement field-level encryption for PII
- Sanitize all user inputs to prevent injection attacks
- Implement CSRF protection
- Use parameterized queries to prevent SQL injection

#### Payment Security
- Never store raw card data
- Use payment gateway tokenization
- Implement PCI DSS Level 1 compliance
- Use 3D Secure for card authentication
- Log all payment attempts for fraud detection
- Implement velocity checks for fraud prevention

#### Audit Logging
Log all critical operations:
- Booking creation attempts (success and failure)
- Payment processing attempts
- Customer information access
- Booking modifications
- Cancellations and refunds
- Administrative actions


### Performance Optimization

#### Database Optimization
- Use connection pooling (min 10, max 100 connections)
- Implement query optimization with proper indexes
- Use compiled queries for frequently executed operations
- Implement database query caching
- Use read replicas for read-heavy operations

#### API Performance
- Target response times: < 200ms for validation, < 1s for booking creation
- Implement async/await for I/O operations
- Use background jobs for non-critical tasks (notifications, analytics)
- Implement request compression (gzip)
- Use CDN for static assets

#### Scalability
- Design stateless APIs for horizontal scaling
- Use distributed caching (Redis) for session data
- Implement message queues for async processing
- Use load balancers for traffic distribution
- Design for multi-region deployment

### Monitoring and Observability

#### Health Checks
- Implement health check endpoints
- Monitor database connectivity
- Monitor payment gateway connectivity
- Monitor email/SMS service connectivity
- Alert on service degradation

#### Metrics Collection
- Track API response times
- Monitor error rates by endpoint
- Track booking conversion rates
- Monitor payment success/failure rates
- Track cache hit rates

#### Logging
- Use structured logging (JSON format)
- Include correlation IDs for request tracing
- Log all errors with stack traces
- Implement log aggregation (ELK stack or similar)
- Set appropriate log levels (Debug, Info, Warning, Error)


## Technology Stack

### Backend Framework
- **Framework:** .NET 8+ with C#
- **API:** ASP.NET Core Web API
- **ORM:** Entity Framework Core 8+
- **Authentication:** ASP.NET Core Identity with JWT
- **Validation:** FluentValidation
- **Logging:** Serilog with structured logging
- **Caching:** Redis for distributed caching
- **Message Queue:** RabbitMQ or Azure Service Bus

### External Integrations
- **Payment Gateway:** Stripe, PayPal, or Braintree
- **Email Service:** SendGrid or AWS SES
- **SMS Service:** Twilio
- **Monitoring:** Application Insights or Datadog
- **Error Tracking:** Sentry or Rollbar

### Development Tools
- **API Documentation:** Swagger/OpenAPI
- **Testing:** xUnit for unit tests, SpecFlow for integration tests
- **Code Quality:** SonarQube for static analysis
- **CI/CD:** GitHub Actions or Azure DevOps

## Implementation Notes

### Critical Considerations

**Booking Atomicity:**
- Use database transactions to ensure all-or-nothing booking creation
- Implement compensating transactions for rollback scenarios
- Handle distributed transaction failures gracefully

**Payment Processing:**
- Separate authorization from capture
- Implement automatic capture on successful booking
- Handle authorization expiration (typically 7 days)
- Implement automatic refund on booking cancellation

**Vehicle Lock Management:**
- Implement background job to cleanup expired locks
- Extend locks automatically as user progresses
- Handle lock conflicts gracefully
- Provide clear messaging when locks expire

**Notification Reliability:**
- Implement retry logic for failed notifications
- Use message queues for async notification delivery
- Track notification delivery status
- Provide manual resend option for customers

