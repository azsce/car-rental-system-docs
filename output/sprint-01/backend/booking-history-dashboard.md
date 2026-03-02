# Feature: Booking History & Dashboard - Backend

## Overview

Backend services for comprehensive booking history management and real-time active trip monitoring. Provides APIs for retrieving, filtering, searching, and exporting booking data, plus real-time trip tracking and vehicle control integration.

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature IDs

- F-BM-011: Comprehensive Booking History
- F-BM-012: Active Trip Dashboard
- F-FUNC-BM-005: Booking History (Functional Requirement)

## Backend Specifications

### API Endpoints

#### GET /api/v1/bookings/history
**Purpose**: Retrieve paginated booking history for authenticated customer

**Authentication**: Required (JWT Bearer token)

**Query Parameters**:
- `status` (string[], optional): Filter by booking status - upcoming, active, completed, cancelled, pending_payment
- `startDate` (ISO 8601 date, optional): Filter bookings from this date
- `endDate` (ISO 8601 date, optional): Filter bookings until this date
- `supplierId` (string[], optional): Filter by supplier IDs
- `vehicleType` (string[], optional): Filter by vehicle types
- `search` (string, optional): Search term for booking reference, vehicle name, location
- `page` (integer, default: 1): Page number for pagination
- `limit` (integer, default: 20, max: 100): Items per page
- `sortBy` (string, default: 'createdAt'): Sort field - createdAt, pickupDate, totalCost, status
- `sortOrder` (string, default: 'desc'): Sort direction - asc, desc

**Response** (200 OK):
```json
{
  "data": [
    {
      "bookingId": "bk_abc123",
      "bookingReference": "ARES-2026-001234",
      "status": "completed",
      "vehicle": {
        "id": "veh_xyz789",
        "name": "Toyota Camry 2024",
        "type": "sedan",
        "imageUrl": "https://cdn.example.com/vehicles/camry.jpg",
        "licensePlate": "ABC-1234"
      },
      "dates": {
        "pickupDate": "2026-02-15T10:00:00Z",
        "returnDate": "2026-02-18T10:00:00Z",
        "actualPickupDate": "2026-02-15T10:15:00Z",
        "actualReturnDate": "2026-02-18T09:45:00Z"
      },
      "location": {
        "pickupLocation": "Cairo Airport",
        "returnLocation": "Cairo Airport",
        "pickupAddress": "Cairo International Airport, Terminal 3",
        "returnAddress": "Cairo International Airport, Terminal 3"
      },
      "pricing": {
        "totalCost": 1500.00,
        "currency": "EGP",
        "breakdown": {
          "baseRate": 1200.00,
          "insurance": 150.00,
          "extras": 50.00,
          "taxes": 120.00,
          "fees": 30.00,
          "discounts": -50.00
        }
      },
      "supplier": {
        "id": "sup_123",
        "name": "Premium Rentals",
        "logoUrl": "https://cdn.example.com/suppliers/premium.jpg"
      },
      "createdAt": "2026-02-10T14:30:00Z",
      "updatedAt": "2026-02-18T10:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 87,
    "itemsPerPage": 20,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "filters": {
    "appliedFilters": {
      "status": ["completed"],
      "startDate": "2026-01-01",
      "endDate": "2026-02-23"
    }
  }
}
```

**Error Responses**:
- 401 Unauthorized: Invalid or missing authentication token
- 400 Bad Request: Invalid query parameters
- 500 Internal Server Error: Server error

---

#### GET /api/v1/bookings/active
**Purpose**: Retrieve active trip information for authenticated customer

**Authentication**: Required (JWT Bearer token)

**Response** (200 OK):
```json
{
  "data": {
    "bookingId": "bk_active123",
    "bookingReference": "ARES-2026-001250",
    "tripStatus": "in_progress",
    "vehicle": {
      "id": "veh_current",
      "name": "Honda CR-V 2024",
      "type": "suv",
      "imageUrl": "https://cdn.example.com/vehicles/crv.jpg",
      "licensePlate": "XYZ-5678",
      "currentLocation": {
        "latitude": 30.0444,
        "longitude": 31.2357,
        "lastUpdated": "2026-02-23T14:30:00Z"
      },
      "status": {
        "locked": true,
        "fuelLevel": 75,
        "batteryLevel": null,
        "odometer": 45230
      }
    },
    "timing": {
      "startTime": "2026-02-23T10:00:00Z",
      "scheduledEndTime": "2026-02-25T10:00:00Z",
      "elapsedMinutes": 270,
      "remainingMinutes": 2610,
      "graceMinutes": 30
    },
    "cost": {
      "currentCharges": 450.00,
      "estimatedTotal": 1800.00,
      "currency": "EGP",
      "lastUpdated": "2026-02-23T14:30:00Z"
    },
    "locations": {
      "pickupLocation": {
        "name": "Downtown Cairo",
        "address": "123 Tahrir Square, Cairo",
        "coordinates": {
          "latitude": 30.0444,
          "longitude": 31.2357
        }
      },
      "returnLocation": {
        "name": "Downtown Cairo",
        "address": "123 Tahrir Square, Cairo",
        "coordinates": {
          "latitude": 30.0444,
          "longitude": 31.2357
        }
      }
    },
    "controls": {
      "canLock": true,
      "canUnlock": true,
      "canHorn": true,
      "canLights": true
    }
  }
}
```

**Response** (204 No Content): No active trip found

**Error Responses**:
- 401 Unauthorized: Invalid or missing authentication token
- 500 Internal Server Error: Server error

---

#### POST /api/v1/bookings/export
**Purpose**: Generate and download booking history export file

**Authentication**: Required (JWT Bearer token)

**Request Body**:
```json
{
  "format": "pdf",
  "startDate": "2026-01-01",
  "endDate": "2026-02-23",
  "includeStatus": ["completed", "cancelled"],
  "detailed": true
}
```

**Response** (200 OK):
```json
{
  "downloadUrl": "https://cdn.example.com/exports/booking-history-abc123.pdf",
  "expiresAt": "2026-02-23T15:30:00Z",
  "fileSize": 245678,
  "format": "pdf"
}
```

**Error Responses**:
- 401 Unauthorized: Invalid or missing authentication token
- 400 Bad Request: Invalid export parameters
- 429 Too Many Requests: Rate limit exceeded
- 500 Internal Server Error: Server error

---

#### POST /api/v1/trips/{tripId}/extend
**Purpose**: Extend active trip duration

**Authentication**: Required (JWT Bearer token)

**Path Parameters**:
- `tripId` (string, required): Active trip/booking identifier

**Request Body**:
```json
{
  "newReturnTime": "2026-02-26T10:00:00Z",
  "paymentMethodId": "pm_card123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "booking": {
    "bookingId": "bk_active123",
    "originalReturnTime": "2026-02-25T10:00:00Z",
    "newReturnTime": "2026-02-26T10:00:00Z",
    "additionalCost": 600.00,
    "newEstimatedTotal": 2400.00,
    "currency": "EGP"
  },
  "payment": {
    "transactionId": "txn_ext123",
    "amount": 600.00,
    "status": "completed"
  }
}
```

**Error Responses**:
- 401 Unauthorized: Invalid or missing authentication token
- 403 Forbidden: Trip does not belong to user
- 404 Not Found: Trip not found or not active
- 400 Bad Request: Invalid extension parameters or vehicle unavailable
- 402 Payment Required: Payment failed
- 500 Internal Server Error: Server error

---

#### POST /api/v1/vehicles/{vehicleId}/control
**Purpose**: Send control command to vehicle (lock, unlock, horn, lights)

**Authentication**: Required (JWT Bearer token)

**Path Parameters**:
- `vehicleId` (string, required): Vehicle identifier

**Request Body**:
```json
{
  "action": "unlock",
  "tripId": "bk_active123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "action": "unlock",
  "vehicleStatus": {
    "locked": false,
    "lastUpdated": "2026-02-23T14:35:00Z"
  },
  "message": "Vehicle unlocked successfully"
}
```

**Error Responses**:
- 401 Unauthorized: Invalid or missing authentication token
- 403 Forbidden: User does not have active trip with this vehicle
- 404 Not Found: Vehicle not found
- 400 Bad Request: Invalid action or vehicle does not support control
- 503 Service Unavailable: Vehicle telematics unavailable
- 500 Internal Server Error: Server error

---

#### GET /api/v1/bookings/{bookingId}
**Purpose**: Retrieve detailed information for specific booking

**Authentication**: Required (JWT Bearer token)

**Path Parameters**:
- `bookingId` (string, required): Booking identifier

**Response** (200 OK): Full booking details object

**Error Responses**:
- 401 Unauthorized: Invalid or missing authentication token
- 403 Forbidden: Booking does not belong to user
- 404 Not Found: Booking not found
- 500 Internal Server Error: Server error

### Business Logic

#### Booking History Retrieval
1. Validate authentication token and extract user ID
2. Parse and validate query parameters
3. Build database query with filters:
   - Filter by user ID (security)
   - Apply status filters if provided
   - Apply date range filters if provided
   - Apply supplier filters if provided
   - Apply vehicle type filters if provided
   - Apply search term across booking reference, vehicle name, location
4. Execute paginated query with sorting
5. Transform database results to API response format
6. Include pagination metadata
7. Return formatted response

#### Active Trip Monitoring
1. Validate authentication token and extract user ID
2. Query for active bookings (status = 'active', pickup completed, return not completed)
3. If no active trip found, return 204 No Content
4. If active trip found:
   - Calculate elapsed time from pickup timestamp
   - Calculate remaining time until scheduled return
   - Estimate current charges based on elapsed time and rate
   - Retrieve vehicle location from telematics service (if available)
   - Retrieve vehicle status (locked, fuel, battery, odometer)
   - Determine available vehicle controls based on telematics capabilities
5. Return formatted active trip data

#### Booking Export Generation
1. Validate authentication token and extract user ID
2. Validate export parameters (format, date range, status filters)
3. Check rate limit for export requests (max 5 per hour per user)
4. Query bookings matching export criteria
5. Generate export file based on format:
   - **CSV**: Generate comma-separated values with headers
   - **PDF**: Generate formatted PDF with branding and tables
   - **Excel**: Generate XLSX with formatted sheets
6. Upload generated file to CDN/storage with expiration (24 hours)
7. Return download URL with expiration timestamp
8. Queue background job to delete expired export files

#### Trip Extension Processing
1. Validate authentication token and extract user ID
2. Validate trip ID and verify ownership
3. Verify trip is currently active
4. Validate new return time:
   - Must be after current scheduled return time
   - Must not exceed maximum rental duration
   - Must be in future
5. Check vehicle availability for extension period
6. Calculate additional cost for extension
7. Process payment for additional cost
8. If payment successful:
   - Update booking return time
   - Update vehicle availability calendar
   - Send notification to supplier
   - Send confirmation to customer
   - Return success response
9. If payment fails, return error with payment details

#### Vehicle Control Command
1. Validate authentication token and extract user ID
2. Validate vehicle ID and action
3. Verify user has active trip with this vehicle
4. Check if vehicle supports requested control action
5. Send command to vehicle telematics service
6. Wait for command acknowledgment (timeout 10 seconds)
7. Retrieve updated vehicle status
8. Log control action for audit trail
9. Return command result and updated status

### Authentication Requirements

All endpoints require JWT Bearer token authentication:
- Token must be valid and not expired
- Token must contain user ID claim
- User must have 'customer' role
- Token must be signed with correct secret key

### Authorization Rules

- Users can only access their own bookings
- Users can only control vehicles they have active trips with
- Export requests are rate-limited per user
- Vehicle control requires active trip verification

### Data Validation

#### Query Parameter Validation
- `status`: Must be valid enum value
- `startDate`, `endDate`: Must be valid ISO 8601 dates
- `page`: Must be positive integer
- `limit`: Must be between 1 and 100
- `sortBy`: Must be valid field name
- `sortOrder`: Must be 'asc' or 'desc'
- `search`: Maximum 100 characters, sanitized for SQL injection

#### Request Body Validation
- `newReturnTime`: Must be valid ISO 8601 datetime, in future, after current return time
- `paymentMethodId`: Must be valid payment method ID belonging to user
- `action`: Must be one of: lock, unlock, horn, lights
- `format`: Must be one of: csv, pdf, excel

### Error Handling

- Database connection errors: Return 500 with generic error message
- Invalid authentication: Return 401 with clear message
- Authorization failures: Return 403 with reason
- Validation errors: Return 400 with field-specific error messages
- Rate limit exceeded: Return 429 with retry-after header
- External service failures (telematics, payment): Return 503 with retry guidance
- Not found errors: Return 404 with resource type

### Performance Optimization

- Index database columns: userId, status, pickupDate, createdAt
- Cache active trip data for 30 seconds to reduce database load
- Use database query optimization for complex filters
- Implement pagination to limit result set size
- Use connection pooling for database connections
- Implement query result caching for common filter combinations
- Use CDN for export file delivery
- Implement background job queue for export generation

### Integration Requirements

#### Database Integration
- Query Bookings table with complex filters and joins
- Join with Vehicles, Suppliers, Locations tables
- Use transactions for trip extension to ensure data consistency
- Implement soft deletes for audit trail

#### Payment Service Integration
- Process additional payment for trip extensions
- Validate payment method belongs to user
- Handle payment failures gracefully
- Store payment transaction records

#### Vehicle Telematics Integration
- Query vehicle location from GPS service
- Send control commands to vehicle
- Handle telematics service unavailability
- Implement timeout and retry logic
- Cache vehicle status to reduce API calls

#### Notification Service Integration
- Send trip extension confirmation emails
- Send supplier notifications for extensions
- Send push notifications for trip status changes

#### Export Service Integration
- Generate CSV files with proper encoding
- Generate PDF files with branding and formatting
- Generate Excel files with multiple sheets
- Upload files to CDN/storage service
- Implement file cleanup for expired exports

## Technology Stack

- **Backend Framework**: .NET 8+ with ASP.NET Core Web API
- **Language**: C# 12+
- **ORM**: Entity Framework Core 8+
- **Database**: MySQL 8.0+ with InnoDB engine
- **Authentication**: JWT tokens with .NET Identity
- **Caching**: Redis for query result caching
- **Background Jobs**: Hangfire for export generation and cleanup
- **File Storage**: Azure Blob Storage or AWS S3 for export files
- **PDF Generation**: iTextSharp or PdfSharp
- **Excel Generation**: EPPlus or ClosedXML
- **API Documentation**: Swagger/OpenAPI

## Implementation Notes

### Database Queries
- Use Entity Framework LINQ queries with proper includes
- Implement query filters for soft deletes
- Use AsNoTracking() for read-only queries
- Implement pagination with Skip() and Take()
- Use compiled queries for frequently executed queries

### Caching Strategy
- Cache active trip data with 30-second TTL
- Cache booking history for common filter combinations (5-minute TTL)
- Invalidate cache on booking updates
- Use Redis for distributed caching across instances

### Security Considerations
- Sanitize all user inputs to prevent SQL injection
- Validate user ownership before returning booking data
- Rate limit export requests to prevent abuse
- Encrypt sensitive data in database
- Log all vehicle control commands for audit
- Implement CORS policies for frontend access
- Use HTTPS for all API communication

### Monitoring and Logging
- Log all API requests with user ID and endpoint
- Track API response times and error rates
- Monitor database query performance
- Alert on high error rates or slow queries
- Track export generation success/failure rates
- Monitor vehicle telematics service availability

### Testing Requirements
- Unit tests for business logic methods
- Integration tests for API endpoints
- Mock external services (payment, telematics)
- Test pagination edge cases
- Test filter combinations
- Test rate limiting behavior
- Test authentication and authorization
