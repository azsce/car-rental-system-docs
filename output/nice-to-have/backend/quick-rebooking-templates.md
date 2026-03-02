# Feature: Quick Rebooking & Booking Templates - Backend

## Overview

Backend services supporting One-Click Rebooking (F-BM-016) and Booking Templates & Favorites (F-BM-017). These services enable rapid booking recreation from history and template-based booking workflows, optimized for power renters and business travelers.

The backend handles booking data retrieval, template storage and management, vehicle availability verification, pricing recalculation, and booking creation with pre-filled data. Performance is critical - rebooking operations must complete in under 30 seconds.

## Sprint Category

Nice-to-have ⭐

## Feature IDs

- F-BM-016: One-Click Rebooking
- F-BM-017: Booking Templates & Favorites

## Backend Specifications

### API Endpoints

#### Rebooking Endpoints

**GET /api/bookings/{bookingId}/rebook-data**
- **Purpose**: Retrieve pre-filled data for rebooking
- **Authentication**: Required (JWT)
- **Authorization**: Customer must own the booking
- **Request Parameters**:
  - `bookingId` (path): Original booking ID
- **Response**: 200 OK
```json
{
  "originalBooking": {
    "id": "string",
    "vehicleId": "string",
    "vehicleName": "string",
    "vehicleCategory": "string",
    "pickupLocationId": "string",
    "returnLocationId": "string",
    "pickupDate": "datetime",
    "returnDate": "datetime",
    "insurance": {
      "type": "string",
      "coverage": "string"
    },
    "extras": [
      {
        "id": "string",
        "name": "string",
        "quantity": "number"
      }
    ],
    "paymentMethodId": "string",
    "totalCost": "decimal",
    "currency": "string"
  },
  "vehicleAvailability": {
    "isAvailable": "boolean",
    "nextAvailableDate": "datetime"
  },
  "alternativeVehicles": [
    {
      "vehicleId": "string",
      "vehicleName": "string",
      "category": "string",
      "dailyRate": "decimal",
      "availability": "boolean"
    }
  ]
}
```
- **Error Responses**:
  - 404: Booking not found
  - 403: Unauthorized access
  - 400: Booking not eligible for rebooking

**POST /api/bookings/rebook**
- **Purpose**: Create new booking from previous booking
- **Authentication**: Required (JWT)
- **Request Body**:
```json
{
  "originalBookingId": "string",
  "pickupDate": "datetime",
  "returnDate": "datetime",
  "vehicleId": "string",
  "useOriginalPreferences": "boolean",
  "modifications": {
    "insurance": "string",
    "extras": ["array"],
    "pickupLocationId": "string",
    "returnLocationId": "string"
  }
}
```
- **Response**: 201 Created
```json
{
  "bookingId": "string",
  "bookingReference": "string",
  "status": "confirmed",
  "totalCost": "decimal",
  "pricingComparison": {
    "originalPrice": "decimal",
    "newPrice": "decimal",
    "difference": "decimal",
    "percentageChange": "decimal"
  },
  "confirmationDetails": {
    "email": "string",
    "sms": "string",
    "qrCode": "string"
  }
}
```
- **Error Responses**:
  - 400: Invalid dates or vehicle unavailable
  - 402: Payment processing failed
  - 409: Booking conflict

#### Booking Template Endpoints

**GET /api/booking-templates**
- **Purpose**: Retrieve customer's booking templates
- **Authentication**: Required (JWT)
- **Query Parameters**:
  - `includeShared` (optional): Include templates shared with user
- **Response**: 200 OK
```json
{
  "templates": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "vehiclePreferences": {
        "type": "string",
        "category": "string",
        "features": ["array"],
        "transmissionType": "string"
      },
      "insurance": "string",
      "extras": ["array"],
      "defaultLocations": {
        "pickupLocationId": "string",
        "returnLocationId": "string"
      },
      "typicalDuration": "number",
      "createdAt": "datetime",
      "lastUsed": "datetime",
      "useCount": "number",
      "isShared": "boolean",
      "sharedBy": "string",
      "sharedWith": ["array"]
    }
  ],
  "totalCount": "number"
}
```

**POST /api/booking-templates**
- **Purpose**: Create new booking template
- **Authentication**: Required (JWT)
- **Request Body**:
```json
{
  "name": "string",
  "description": "string",
  "vehiclePreferences": {
    "type": "string",
    "category": "string",
    "features": ["array"],
    "transmissionType": "string"
  },
  "insurance": "string",
  "extras": ["array"],
  "defaultLocations": {
    "pickupLocationId": "string",
    "returnLocationId": "string"
  },
  "typicalDuration": "number",
  "sourceBookingId": "string"
}
```
- **Response**: 201 Created
```json
{
  "templateId": "string",
  "name": "string",
  "createdAt": "datetime"
}
```
- **Error Responses**:
  - 400: Invalid template data
  - 409: Template name already exists

**PUT /api/booking-templates/{templateId}**
- **Purpose**: Update existing template
- **Authentication**: Required (JWT)
- **Authorization**: Customer must own the template
- **Request Body**: Same as POST
- **Response**: 200 OK
- **Error Responses**:
  - 404: Template not found
  - 403: Unauthorized

**DELETE /api/booking-templates/{templateId}**
- **Purpose**: Delete booking template
- **Authentication**: Required (JWT)
- **Authorization**: Customer must own the template
- **Response**: 204 No Content
- **Error Responses**:
  - 404: Template not found
  - 403: Unauthorized

**POST /api/booking-templates/{templateId}/share**
- **Purpose**: Share template with colleagues (corporate only)
- **Authentication**: Required (JWT)
- **Authorization**: Corporate account required
- **Request Body**:
```json
{
  "recipientEmails": ["array"],
  "permissions": "view_only | can_modify",
  "message": "string"
}
```
- **Response**: 200 OK
```json
{
  "sharedWith": ["array"],
  "invitationsSent": "number"
}
```

**POST /api/bookings/from-template**
- **Purpose**: Create booking from template
- **Authentication**: Required (JWT)
- **Request Body**:
```json
{
  "templateId": "string",
  "pickupDate": "datetime",
  "returnDate": "datetime",
  "modifications": {
    "vehicleId": "string",
    "insurance": "string",
    "extras": ["array"]
  }
}
```
- **Response**: 201 Created (same as rebooking endpoint)

### Request/Response Schemas

#### RebookingRequest Schema
```
{
  originalBookingId: string (required, UUID),
  pickupDate: datetime (required, ISO 8601),
  returnDate: datetime (required, ISO 8601),
  vehicleId: string (optional, UUID),
  useOriginalPreferences: boolean (default: true),
  modifications: {
    insurance: string (optional),
    extras: array (optional),
    pickupLocationId: string (optional),
    returnLocationId: string (optional)
  }
}
```

**Validation Rules**:
- pickupDate must be in the future
- returnDate must be after pickupDate
- Minimum rental duration: 1 day
- Maximum rental duration: 90 days
- Original booking must be completed
- Customer must have valid payment method

#### BookingTemplate Schema
```
{
  id: string (UUID),
  customerId: string (UUID),
  name: string (required, max 100 chars),
  description: string (optional, max 500 chars),
  vehiclePreferences: {
    type: string (enum: sedan, suv, truck, van, luxury, sports),
    category: string (enum: economy, standard, premium, luxury),
    features: array (optional),
    transmissionType: string (enum: automatic, manual)
  },
  insurance: string (enum: basic, standard, premium, full),
  extras: array (extra IDs),
  defaultLocations: {
    pickupLocationId: string (UUID),
    returnLocationId: string (UUID)
  },
  typicalDuration: number (days, 1-90),
  createdAt: datetime,
  updatedAt: datetime,
  lastUsed: datetime,
  useCount: number,
  isShared: boolean,
  sharedBy: string (UUID, optional),
  sharedWith: array (customer IDs)
}
```

### Business Logic

#### Rebooking Logic

**Eligibility Validation**
1. Verify original booking exists and is completed
2. Confirm customer owns the booking
3. Check booking completion date (must be within last 2 years)
4. Validate customer account status (active, not suspended)
5. Verify customer has valid payment method

**Vehicle Availability Check**
1. Check if original vehicle is available for new dates
2. If unavailable, query similar vehicles in same category
3. Apply customer preferences (transmission, features)
4. Sort alternatives by similarity score and price
5. Return top 5 alternatives

**Pricing Recalculation**
1. Retrieve current pricing rules for vehicle and dates
2. Apply seasonal adjustments and demand-based pricing
3. Calculate insurance and extras costs
4. Apply customer loyalty discounts if applicable
5. Calculate total cost and compare with original booking
6. Generate pricing comparison report

**Preference Application**
1. Load saved preferences from original booking
2. Verify insurance type is still available
3. Check extras availability
4. Validate locations are still operational
5. Apply preferences to new booking
6. Allow customer modifications before confirmation

**Booking Creation**
1. Reserve vehicle for new dates
2. Create booking record with pre-filled data
3. Process payment using saved payment method
4. Generate booking reference and confirmation
5. Send confirmation email and SMS
6. Update rebooking metrics
7. Target completion time: under 30 seconds

#### Template Management Logic

**Template Creation**
1. Validate template name uniqueness for customer
2. Verify vehicle preferences are valid
3. Validate location IDs exist
4. Check insurance and extras availability
5. Store template with customer association
6. If created from booking, link source booking ID

**Template Application**
1. Load template data
2. Verify all preferences are still valid
3. Check vehicle availability matching preferences
4. Apply current pricing
5. Allow customer modifications
6. Create booking with template settings

**Template Sharing (Corporate)**
1. Verify customer has corporate account
2. Validate recipient email addresses
3. Check sharing permissions
4. Create sharing records
5. Send invitation emails
6. Track template usage across shared users

### Authentication Requirements

- All endpoints require valid JWT token
- Token must contain customer ID and account type
- Corporate features require corporate account flag
- Template sharing requires corporate_admin role
- Rebooking requires ownership verification
- Rate limiting: 10 rebooking attempts per minute per customer

### Performance Optimization

- Cache booking history data (5-minute TTL)
- Index bookings by customer ID and completion date
- Preload vehicle availability for likely rebooking candidates
- Use database read replicas for template queries
- Implement async processing for confirmation emails
- Target API response times:
  - Rebook data retrieval: < 500ms
  - Rebooking creation: < 2 seconds
  - Template operations: < 300ms

### Error Handling

**Rebooking Errors**
- Vehicle unavailable: Return alternatives with suggestions
- Payment failure: Retry with fallback payment method
- Pricing changed significantly: Require customer confirmation
- Location closed: Suggest nearby alternatives
- Date conflict: Suggest alternative dates

**Template Errors**
- Invalid preferences: Return validation errors with details
- Sharing limit exceeded: Return quota information
- Template not found: Return 404 with helpful message
- Duplicate name: Suggest alternative names

## Technology Stack

- **Framework**: .NET 8+ with ASP.NET Core Web API
- **Language**: C#
- **ORM**: Entity Framework Core
- **Authentication**: JWT with .NET Identity
- **Caching**: Redis for performance optimization
- **Background Jobs**: Hangfire for async processing
- **API Documentation**: Swagger/OpenAPI

## Implementation Notes

### Dependencies

- Requires booking history system (F-BM-011)
- Integrates with vehicle availability service
- Uses pricing calculation engine
- Connects to payment processing system
- Leverages notification service for confirmations

### Security Considerations

- Validate booking ownership on all operations
- Sanitize template names and descriptions
- Rate limit rebooking attempts to prevent abuse
- Encrypt sensitive template data at rest
- Audit log all rebooking and template operations
- Implement CSRF protection for state-changing operations

### Monitoring and Metrics

Track the following metrics:
- Rebooking success rate
- Average rebooking completion time
- Template creation and usage rates
- Template sharing activity (corporate)
- Vehicle availability hit rate for rebooking
- Pricing comparison statistics
- Error rates by type

### Business Rules

- Rebooking only available for completed bookings
- Maximum 2-year lookback for rebooking history
- Templates limited to 20 per customer
- Corporate accounts can share up to 50 templates
- Shared templates count toward recipient's limit
- Template modifications don't affect original template
- Rebooking inherits original booking's loyalty points eligibility
