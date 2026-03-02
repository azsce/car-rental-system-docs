# Feature: Supplier Directory & Profiles - Backend

## Overview

Backend services for the Supplier Directory & Profiles feature, providing RESTful APIs for supplier data management, metrics calculation, profile retrieval, and comparison functionality. This backend supports browsing, filtering, and evaluating rental suppliers with comprehensive operational metrics and fleet information.

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature ID

F-SD-011

## API Endpoints

### Supplier Directory Endpoints

**GET /api/suppliers**
- **Purpose**: Retrieve paginated list of suppliers with filtering and sorting capabilities
- **Authentication**: Optional (public endpoint, enhanced data for authenticated users)
- **Rate Limiting**: 100 requests per minute per IP
- **Query Parameters**:
  - `page` (integer, optional, default: 1): Page number for pagination
  - `limit` (integer, optional, default: 20, max: 100): Number of suppliers per page
  - `minRating` (decimal, optional, range: 0-5): Minimum rating filter
  - `location` (string, optional): Filter by city or region name
  - `specialization` (string, optional): Filter by specialization (luxury, electric, accessible, commercial, budget)
  - `fleetSize` (string, optional): Filter by fleet size category (small, medium, large)
  - `sortBy` (string, optional, default: rating): Sort field (rating, name, fleetSize, responseTime)
  - `sortOrder` (string, optional, default: desc): Sort direction (asc, desc)
  - `search` (string, optional): Full-text search on supplier name and description
- **Response**: 200 OK
- **Error Responses**:
  - 400 Bad Request: Invalid query parameters
  - 429 Too Many Requests: Rate limit exceeded
  - 500 Internal Server Error: Server error

**GET /api/suppliers/{supplierId}**
- **Purpose**: Retrieve detailed supplier profile with comprehensive information
- **Authentication**: Optional
- **Rate Limiting**: 200 requests per minute per IP
- **Path Parameters**:
  - `supplierId` (GUID, required): Unique supplier identifier
- **Response**: 200 OK with supplier profile
- **Error Responses**:
  - 400 Bad Request: Invalid supplier ID format
  - 404 Not Found: Supplier does not exist
  - 500 Internal Server Error: Server error

**GET /api/suppliers/{supplierId}/vehicles**
- **Purpose**: Retrieve all vehicles offered by a specific supplier
- **Authentication**: Optional
- **Rate Limiting**: 100 requests per minute per IP
- **Path Parameters**:
  - `supplierId` (GUID, required): Unique supplier identifier
- **Query Parameters**:
  - `page` (integer, optional, default: 1): Page number
  - `limit` (integer, optional, default: 20): Vehicles per page
  - `category` (string, optional): Filter by vehicle category
  - `available` (boolean, optional): Show only currently available vehicles
  - `sortBy` (string, optional): Sort by price, rating, or name
- **Response**: 200 OK with vehicle list
- **Error Responses**:
  - 400 Bad Request: Invalid parameters
  - 404 Not Found: Supplier not found
  - 500 Internal Server Error: Server error

**GET /api/suppliers/{supplierId}/locations**
- **Purpose**: Retrieve all operational locations for a supplier
- **Authentication**: Optional
- **Rate Limiting**: 200 requests per minute per IP
- **Path Parameters**:
  - `supplierId` (GUID, required): Unique supplier identifier
- **Response**: 200 OK with location list including coordinates
- **Error Responses**:
  - 404 Not Found: Supplier not found
  - 500 Internal Server Error: Server error

**GET /api/suppliers/{supplierId}/reviews**
- **Purpose**: Retrieve customer reviews and ratings for a supplier
- **Authentication**: Optional
- **Rate Limiting**: 100 requests per minute per IP
- **Path Parameters**:
  - `supplierId` (GUID, required): Unique supplier identifier
- **Query Parameters**:
  - `page` (integer, optional, default: 1): Page number
  - `limit` (integer, optional, default: 10): Reviews per page
  - `sortBy` (string, optional, default: date): Sort by date, rating, or helpfulness
  - `minRating` (integer, optional): Filter by minimum rating (1-5)
- **Response**: 200 OK with review list and rating breakdown
- **Error Responses**:
  - 404 Not Found: Supplier not found
  - 500 Internal Server Error: Server error

**GET /api/suppliers/{supplierId}/metrics**
- **Purpose**: Retrieve operational performance metrics for a supplier
- **Authentication**: Optional
- **Rate Limiting**: 200 requests per minute per IP
- **Path Parameters**:
  - `supplierId` (GUID, required): Unique supplier identifier
- **Response**: 200 OK with operational metrics
- **Error Responses**:
  - 404 Not Found: Supplier not found or metrics not available
  - 500 Internal Server Error: Server error

**GET /api/suppliers/compare**
- **Purpose**: Retrieve comparison data for multiple suppliers side-by-side
- **Authentication**: Optional
- **Rate Limiting**: 50 requests per minute per IP
- **Query Parameters**:
  - `supplierIds` (string, required): Comma-separated list of supplier GUIDs (max: 4)
- **Response**: 200 OK with comparison data structure
- **Error Responses**:
  - 400 Bad Request: Invalid supplier IDs or too many suppliers
  - 404 Not Found: One or more suppliers not found
  - 500 Internal Server Error: Server error

### Supplier Management Endpoints (Admin/Supplier Access)

**POST /api/suppliers**
- **Purpose**: Create a new supplier profile
- **Authentication**: Required (Admin only)
- **Request Body**: Supplier creation data
- **Response**: 201 Created with new supplier ID
- **Error Responses**:
  - 400 Bad Request: Invalid data
  - 401 Unauthorized: Not authenticated
  - 403 Forbidden: Insufficient permissions
  - 409 Conflict: Supplier already exists

**PUT /api/suppliers/{supplierId}**
- **Purpose**: Update supplier profile information
- **Authentication**: Required (Supplier owner or Admin)
- **Path Parameters**:
  - `supplierId` (GUID, required): Supplier to update
- **Request Body**: Updated supplier data
- **Response**: 200 OK with updated supplier
- **Error Responses**:
  - 400 Bad Request: Invalid data
  - 401 Unauthorized: Not authenticated
  - 403 Forbidden: Not authorized to update this supplier
  - 404 Not Found: Supplier not found

**DELETE /api/suppliers/{supplierId}**
- **Purpose**: Soft delete a supplier (mark as inactive)
- **Authentication**: Required (Admin only)
- **Path Parameters**:
  - `supplierId` (GUID, required): Supplier to delete
- **Response**: 204 No Content
- **Error Responses**:
  - 401 Unauthorized: Not authenticated
  - 403 Forbidden: Insufficient permissions
  - 404 Not Found: Supplier not found
  - 409 Conflict: Supplier has active bookings

## Business Logic

### Supplier Rating Calculation

**Algorithm**:
```
1. Fetch all reviews for supplier from last 24 months
2. Apply recency weighting:
   - Last 3 months: weight = 1.0
   - 3-6 months: weight = 0.9
   - 6-12 months: weight = 0.7
   - 12-24 months: weight = 0.5
3. Calculate weighted average:
   weightedSum = sum(rating * weight * reviewCount)
   totalWeight = sum(weight * reviewCount)
   overallRating = weightedSum / totalWeight
4. Round to 2 decimal places
5. Update Suppliers.OverallRating
6. Update Suppliers.ReviewCount
```

**Trigger**: Execute after each new review submission

**Category Ratings**:
- Calculate separate ratings for: Service, Vehicle Quality, Value, Communication
- Use same recency weighting algorithm
- Store in SupplierMetrics table

### Fleet Size Classification

**Classification Rules**:
- Small: 1-10 vehicles
- Medium: 11-50 vehicles
- Large: 51+ vehicles

**Update Trigger**: Execute when vehicles are added or removed from supplier fleet

**Implementation**:
```
1. Count active vehicles for supplier
2. Classify based on count
3. Update Suppliers.FleetSize
4. Return classification string
```

### Response Time Calculation

**Algorithm**:
```
1. Fetch all customer inquiries/messages for supplier from last 90 days
2. For each inquiry:
   - Calculate time difference between inquiry and first response
   - Convert to minutes
3. Calculate average response time in minutes
4. Update SupplierMetrics.AverageResponseTimeMinutes
5. Format for display:
   - <60 minutes: "Usually responds within 1 hour"
   - 60-120 minutes: "Usually responds within 2 hours"
   - 120-360 minutes: "Usually responds within 6 hours"
   - 360-1440 minutes: "Usually responds within 24 hours"
   - >1440 minutes: "Response time varies"
```

**Scheduled Job**: Run daily at 2:00 AM UTC

### Cancellation Rate Calculation

**Algorithm**:
```
1. Fetch all bookings for supplier from last 12 months
2. Count total bookings
3. Count bookings cancelled by supplier (not customer)
4. Calculate rate: (supplierCancellations / totalBookings) * 100
5. Round to 2 decimal places
6. Update SupplierMetrics.CancellationRate
7. Apply threshold flags:
   - <2%: Green (Excellent)
   - 2-5%: Yellow (Fair)
   - >5%: Red (Poor - flag for review)
   - >10%: Automatic suspension trigger
```

**Scheduled Job**: Run daily at 3:00 AM UTC

**Suspension Logic**:
- If cancellation rate > 10%, trigger automatic review
- Send notification to admin team
- Optionally suspend supplier pending investigation

### Booking Completion Rate Calculation

**Algorithm**:
```
1. Fetch all bookings for supplier from last 12 months
2. Count total bookings
3. Count successfully completed bookings (not cancelled, not no-show)
4. Calculate rate: (completedBookings / totalBookings) * 100
5. Round to 2 decimal places
6. Update SupplierMetrics.BookingCompletionRate
```

**Scheduled Job**: Run daily at 3:00 AM UTC

### Specialization Assignment

**Automatic Assignment Rules**:
```
1. Analyze supplier's fleet composition
2. Calculate percentage of vehicles in each category
3. Assign specializations based on thresholds:
   - Luxury: >30% luxury vehicles
   - Electric: >50% electric/hybrid vehicles
   - Accessible: Has any accessible vehicles with modifications
   - Commercial: >40% trucks/vans/buses
   - Budget: >70% economy vehicles
   - Exotic: >20% exotic/sports cars
   - Vintage: >20% vintage/classic cars
4. Insert into SupplierSpecializations table
5. Remove specializations that no longer meet threshold
```

**Scheduled Job**: Run weekly on Sundays at 4:00 AM UTC

**Manual Override**: Admins can manually add/remove specializations

### Supplier Verification

**Verification Process**:
```
1. Supplier submits verification documents:
   - Business registration
   - Insurance certificate (minimum coverage)
   - Vehicle ownership/lease documents
   - Background check (for individual hosts)
2. Admin reviews documents
3. If approved:
   - Set Suppliers.IsVerified = TRUE
   - Set Suppliers.VerificationDate = NOW()
   - Send verification confirmation email
4. If rejected:
   - Send rejection email with reasons
   - Allow resubmission
```

**Verification Expiry**:
- Verification expires after 12 months
- Send reminder email 30 days before expiry
- Automatically set IsVerified = FALSE on expiry date
- Require re-verification

### Search and Filtering Logic

**Full-Text Search**:
```
1. Use MySQL FULLTEXT index on Suppliers(Name, Description, Tagline)
2. Query: MATCH(Name, Description, Tagline) AGAINST(searchTerm IN NATURAL LANGUAGE MODE)
3. Order by relevance score
4. Apply additional filters (rating, location, specialization)
```

**Location Filtering**:
```
1. If location parameter provided:
   - Join with SupplierLocations table
   - Filter by City or Region (case-insensitive)
   - Return suppliers with at least one matching location
```

**Specialization Filtering**:
```
1. If specialization parameter provided:
   - Join with SupplierSpecializations table
   - Filter by Specialization enum value
   - Return suppliers with matching specialization
```

**Rating Filtering**:
```
1. If minRating parameter provided:
   - Filter WHERE Suppliers.OverallRating >= minRating
```

**Fleet Size Filtering**:
```
1. If fleetSize parameter provided:
   - Map to vehicle count ranges:
     - small: FleetSize BETWEEN 1 AND 10
     - medium: FleetSize BETWEEN 11 AND 50
     - large: FleetSize >= 51
```

### Comparison Data Aggregation

**Algorithm**:
```
1. Validate supplierIds (max 4, all must exist)
2. For each supplier:
   - Fetch basic profile data
   - Fetch current metrics
   - Fetch location count
   - Calculate price range from fleet
   - Fetch specializations
3. Return normalized comparison structure
4. Frontend displays side-by-side
```

## Data Validation

### Supplier Profile Validation

**Name**:
- Required, 2-200 characters
- No special characters except spaces, hyphens, apostrophes
- Unique within system

**Email**:
- Required, valid email format
- Maximum 255 characters
- Unique within system

**Phone**:
- Optional, valid phone format
- International format supported (E.164)
- Maximum 50 characters

**Website**:
- Optional, valid URL format
- Must start with http:// or https://
- Maximum 500 characters

**Description**:
- Optional, maximum 5000 characters
- HTML tags stripped for security
- Profanity filter applied

**Logo URL**:
- Optional, valid URL format
- Must be image file (jpg, png, gif, webp)
- Maximum 500 characters

### Query Parameter Validation

**Page**:
- Must be positive integer
- Default: 1
- Maximum: 1000 (prevent excessive pagination)

**Limit**:
- Must be positive integer
- Minimum: 1
- Maximum: 100
- Default: 20

**MinRating**:
- Must be decimal between 0 and 5
- Maximum 2 decimal places

**SortBy**:
- Must be one of: rating, name, fleetSize, responseTime
- Case-insensitive

**SortOrder**:
- Must be one of: asc, desc
- Case-insensitive

**Specialization**:
- Must be valid enum value
- Case-insensitive

**FleetSize**:
- Must be one of: small, medium, large
- Case-insensitive

## Error Handling

### Common Error Scenarios

**Supplier Not Found (404)**:
```json
{
  "error": "SupplierNotFound",
  "message": "Supplier with ID {supplierId} does not exist",
  "statusCode": 404
}
```

**Invalid Supplier ID Format (400)**:
```json
{
  "error": "InvalidSupplierId",
  "message": "Supplier ID must be a valid GUID",
  "statusCode": 400
}
```

**Invalid Query Parameters (400)**:
```json
{
  "error": "InvalidParameters",
  "message": "Invalid query parameters",
  "details": [
    "minRating must be between 0 and 5",
    "limit must not exceed 100"
  ],
  "statusCode": 400
}
```

**Rate Limit Exceeded (429)**:
```json
{
  "error": "RateLimitExceeded",
  "message": "Too many requests. Please try again later.",
  "retryAfter": 60,
  "statusCode": 429
}
```

**Unauthorized (401)**:
```json
{
  "error": "Unauthorized",
  "message": "Authentication required",
  "statusCode": 401
}
```

**Forbidden (403)**:
```json
{
  "error": "Forbidden",
  "message": "You do not have permission to perform this action",
  "statusCode": 403
}
```

**Internal Server Error (500)**:
```json
{
  "error": "InternalServerError",
  "message": "An unexpected error occurred. Please try again later.",
  "statusCode": 500,
  "requestId": "uuid"
}
```

### Error Logging

**Log Levels**:
- ERROR: 500 errors, database failures, external service failures
- WARN: 404 errors, validation failures, rate limit hits
- INFO: Successful requests, cache hits/misses
- DEBUG: Query execution times, parameter values

**Log Format**:
```json
{
  "timestamp": "ISO 8601 datetime",
  "level": "ERROR|WARN|INFO|DEBUG",
  "requestId": "uuid",
  "endpoint": "/api/suppliers/{supplierId}",
  "method": "GET",
  "statusCode": 500,
  "error": "Error message",
  "stackTrace": "Stack trace for errors",
  "userId": "User ID if authenticated",
  "ipAddress": "Client IP",
  "duration": "Request duration in ms"
}
```

## Performance Optimization

### Caching Strategy

**Supplier Profile Cache**:
- Cache key: `supplier:profile:{supplierId}`
- TTL: 1 hour
- Invalidate on: Supplier profile update
- Storage: Redis

**Supplier List Cache**:
- Cache key: `supplier:list:{hash of query params}`
- TTL: 15 minutes
- Invalidate on: New supplier added, supplier updated
- Storage: Redis

**Supplier Metrics Cache**:
- Cache key: `supplier:metrics:{supplierId}`
- TTL: 6 hours
- Invalidate on: Metrics recalculation job
- Storage: Redis

**Supplier Locations Cache**:
- Cache key: `supplier:locations:{supplierId}`
- TTL: 24 hours
- Invalidate on: Location added/updated/deleted
- Storage: Redis

### Database Query Optimization

**Use Indexes**:
- All filtering and sorting queries use appropriate indexes
- Composite indexes for common query patterns
- Full-text index for search queries

**Pagination**:
- Use LIMIT and OFFSET for pagination
- Consider cursor-based pagination for large datasets
- Return total count separately (cached)

**Eager Loading**:
- Load related data (locations, specializations, metrics) in single query
- Use JOIN operations instead of N+1 queries

**Database Views**:
- Create view for supplier list with pre-joined data
- Simplifies queries and improves performance

### API Response Optimization

**Compression**:
- Enable gzip compression for all responses
- Reduces payload size by 70-80%

**Partial Responses**:
- Support `fields` query parameter to return only requested fields
- Reduces payload size for mobile clients

**ETags**:
- Generate ETag for supplier profiles
- Support conditional requests (If-None-Match)
- Return 304 Not Modified when appropriate

## Security Considerations

### Input Validation

- Validate all query parameters and path parameters
- Sanitize user input to prevent SQL injection
- Use parameterized queries for all database operations
- Validate GUID format for supplier IDs
- Limit string lengths to prevent buffer overflow

### Rate Limiting

- Implement rate limiting per IP address
- Different limits for different endpoints
- Return 429 status code when limit exceeded
- Include Retry-After header

### Authentication & Authorization

- Public endpoints: No authentication required
- Supplier management endpoints: Require authentication
- Verify supplier ownership before allowing updates
- Admin-only endpoints: Require admin role

### Data Protection

- Do not expose sensitive supplier data (internal IDs, financial data)
- Mask email addresses for non-authenticated users
- Protect phone numbers from scraping (CAPTCHA for contact)
- Audit log all supplier profile changes

### API Security

- Implement CORS with whitelist of allowed origins
- Use HTTPS only (redirect HTTP to HTTPS)
- Set security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- Implement request signing for sensitive operations

## Monitoring and Logging

### Key Metrics

**Performance Metrics**:
- API response time (p50, p95, p99)
- Database query execution time
- Cache hit rate
- Error rate by endpoint

**Business Metrics**:
- Supplier profile views
- Supplier comparison usage
- Filter usage distribution
- Search query patterns
- Conversion rate (profile view → booking)

**System Metrics**:
- CPU usage
- Memory usage
- Database connection pool utilization
- Cache memory usage

### Alerts

**Performance Alerts**:
- Alert if p95 response time > 500ms
- Alert if error rate > 1%
- Alert if cache hit rate < 80%
- Alert if database query time > 200ms

**Business Alerts**:
- Alert if supplier cancellation rate > 10%
- Alert if supplier response time > 48 hours
- Alert if supplier rating drops below 3.0
- Alert for suspicious activity patterns

### Health Checks

**Endpoint**: GET /api/health/suppliers
- Check database connectivity
- Check cache connectivity
- Check external service dependencies
- Return 200 OK if healthy, 503 Service Unavailable if unhealthy

## Technology Stack

- **Framework**: ASP.NET Core 8.0 Web API
- **Language**: C# 12
- **ORM**: Entity Framework Core 8.0
- **Database**: MySQL 8.0+
- **Caching**: Redis 7.0+
- **Logging**: Serilog with structured logging
- **API Documentation**: Swagger/OpenAPI 3.0
- **Authentication**: JWT Bearer tokens
- **Validation**: FluentValidation
- **Mapping**: AutoMapper

## Dependencies

- Vehicle Service (for fleet data)
- Review Service (for ratings and reviews)
- Location Service (for geocoding and mapping)
- Booking Service (for metrics calculation)
- User Service (for authentication)
- Notification Service (for alerts)

## Testing Strategy

### Unit Tests

- Supplier rating calculation logic
- Fleet size classification
- Response time calculation
- Cancellation rate calculation
- Specialization assignment logic
- Input validation logic
- Error handling logic

### Integration Tests

- API endpoint responses
- Database queries and updates
- Cache operations
- External service integrations
- Authentication and authorization

### Performance Tests

- Load testing with 1000 concurrent users
- Stress testing to find breaking point
- Endurance testing for memory leaks
- Spike testing for traffic surges

### Security Tests

- SQL injection attempts
- XSS attempts
- Authentication bypass attempts
- Authorization bypass attempts
- Rate limiting effectiveness
