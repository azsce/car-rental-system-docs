# Feature: Favorite Vehicles (Backend)

## Overview

Backend implementation for the Favorite Vehicles feature, providing RESTful API endpoints for managing user favorite vehicles, monitoring price changes, checking availability, processing alerts, and generating shareable favorites lists. This service handles favorite persistence, price tracking, notification delivery, and analytics.

## Sprint Category

nice-to-have

## Feature ID

F-SD-014

## API Endpoints

### Favorite Management

**POST /api/favorites**
- Add vehicle to user's favorites list
- Validates vehicle exists and user hasn't exceeded limit (100 favorites)
- Creates favorite with optional alert preferences
- Status codes: 201 Created, 400 Bad Request, 401 Unauthorized, 409 Conflict (duplicate)

**GET /api/favorites**
- Retrieve all favorited vehicles for authenticated user
- Supports filtering (vehicle type, price range, availability)
- Supports sorting (date added, price, rating, name)
- Includes pagination (default 20 per page)
- Returns enriched data with current vehicle details
- Status codes: 200 OK, 401 Unauthorized

**GET /api/favorites/{vehicleId}**
- Check if specific vehicle is in user's favorites
- Returns favorite details if exists, 404 if not
- Includes alert preferences and metadata
- Status codes: 200 OK, 401 Unauthorized, 404 Not Found

**DELETE /api/favorites/{vehicleId}**
- Remove vehicle from user's favorites
- Cancels all pending alerts for this favorite
- Soft delete for audit trail
- Status codes: 204 No Content, 401 Unauthorized, 404 Not Found

**PUT /api/favorites/{vehicleId}**
- Update favorite notes or alert preferences
- Partial updates supported
- Status codes: 200 OK, 400 Bad Request, 401 Unauthorized, 404 Not Found

### Availability Checking

**GET /api/favorites/{vehicleId}/availability**
- Check real-time availability for favorited vehicle
- Requires pickup/return dates and location in query parameters
- Returns availability status and pricing
- Caches results for 5 minutes
- Status codes: 200 OK, 400 Bad Request, 401 Unauthorized, 404 Not Found

**POST /api/favorites/{vehicleId}/availability/watch**
- Set up availability monitoring for specific dates
- Stores preferred dates and location for automatic checking
- Triggers alerts when availability changes
- Status codes: 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found

### Alert Management

**POST /api/favorites/{vehicleId}/alerts**
- Configure alert preferences for specific favorite
- Set price change threshold and notification channels
- Enable/disable specific alert types
- Status codes: 200 OK, 400 Bad Request, 401 Unauthorized, 404 Not Found

**GET /api/favorites/alerts/history**
- Retrieve alert history for all user's favorites
- Supports pagination and date range filtering
- Includes alert type, delivery status, and user interactions
- Status codes: 200 OK, 401 Unauthorized

**POST /api/favorites/alerts/test**
- Send test notification to verify alert configuration
- Useful for users to confirm notification preferences
- Status codes: 200 OK, 401 Unauthorized

### Bulk Operations

**POST /api/favorites/bulk**
- Add multiple vehicles to favorites at once
- Validates all vehicles exist before adding any
- Atomic operation (all or nothing)
- Returns array of created favorites
- Status codes: 201 Created, 400 Bad Request, 401 Unauthorized

**DELETE /api/favorites/bulk**
- Remove multiple vehicles from favorites
- Accepts array of vehicle IDs
- Cancels all alerts for removed favorites
- Status codes: 204 No Content, 401 Unauthorized

### Sharing

**POST /api/favorites/share**
- Generate shareable link for user's favorites list
- Configurable expiration and privacy settings
- Optional password protection
- Status codes: 201 Created, 401 Unauthorized

**GET /api/favorites/shared/{token}**
- Access shared favorites list via public token
- Validates token and expiration
- Checks password if required
- Tracks access count and timestamp
- Status codes: 200 OK, 401 Unauthorized (password required), 404 Not Found, 410 Gone (expired)

**DELETE /api/favorites/share/{shareId}**
- Revoke shared link before expiration
- Prevents further access via token
- Status codes: 204 No Content, 401 Unauthorized, 404 Not Found

### Analytics

**GET /api/favorites/stats**
- Retrieve user's favorite statistics
- Total favorites count, most favorited categories, price trends
- Average price of favorites, availability summary
- Status codes: 200 OK, 401 Unauthorized

**GET /api/favorites/{vehicleId}/price-history**
- Retrieve price history for favorited vehicle
- Returns time-series data for charting
- Includes price changes and percentage changes
- Status codes: 200 OK, 401 Unauthorized, 404 Not Found

## Business Logic

### Favorite Validation
- Verify vehicle exists in system and is active (not deleted)
- Check user hasn't exceeded maximum favorites limit (100)
- Prevent duplicate favorites (same user + vehicle combination)
- Validate alert preferences are within allowed ranges
- Ensure price change threshold is between 1% and 50%

### Price Monitoring Engine
```
Background Job (runs hourly):
1. Query all favorite_vehicles with price alerts enabled
2. For each favorite:
   a. Fetch current vehicle price from pricing service
   b. Compare with last recorded price in favorite_price_history
   c. Calculate price change percentage
   d. If change >= user threshold:
      - Generate price change alert
      - Send notification via user-preferred channels
      - Log alert in favorite_vehicle_alerts
   e. Record current price in favorite_price_history
3. Update last_checked timestamp for all favorites
```

### Availability Monitoring
```
Background Job (runs every 30 minutes):
1. Query favorites with availability alerts enabled and preferred dates set
2. For each favorite:
   a. Check vehicle availability for preferred dates
   b. Compare with previous availability status
   c. If status changed from unavailable to available:
      - Generate availability alert
      - Send notification
      - Log alert
   d. Update availability status cache
```

### Alert Generation
- Price Change Alert: Include old price, new price, percentage change, vehicle details
- Availability Alert: Include vehicle details, available dates, booking link
- Price Drop Alert: Special case of price change with positive messaging
- Notification content personalized with user name and vehicle name
- Include direct link to vehicle details page with tracking parameters

### Notification Delivery
- Email notifications via SendGrid with HTML templates
- Push notifications via Firebase Cloud Messaging
- Track delivery status (sent, delivered, failed, bounced)
- Implement retry logic for failed deliveries (max 3 attempts with exponential backoff)
- Track user interactions (opened, clicked)
- Respect user notification preferences and quiet hours

### Share Link Security
- Generate cryptographically secure random tokens (64 characters, URL-safe base64)
- Hash passwords using bcrypt with salt (if password protection enabled)
- Validate token format and expiration on each access
- Rate limit share link access (100 requests per hour per token)
- Track access patterns for security monitoring
- Automatically expire shares after configured duration

### Caching Strategy
- Cache favorite status for vehicles (key: `favorite:{userId}:{vehicleId}`, TTL: 5 minutes)
- Cache user's favorites list (key: `favorites:{userId}`, TTL: 1 minute)
- Cache vehicle availability results (key: `availability:{vehicleId}:{dates}`, TTL: 5 minutes)
- Cache vehicle pricing (key: `price:{vehicleId}`, TTL: 15 minutes)
- Invalidate caches on favorite add/remove operations

### User Limits and Quotas
- Maximum 100 favorites per user
- Maximum 5 share links per user
- Maximum 10 price alerts per day per user
- Maximum 1000 API requests per hour per user
- Enforce limits with clear error messages and HTTP 429 status

## Authentication and Authorization

### JWT Token Validation
- All endpoints require valid JWT token (except public share links)
- Token must contain user ID and role claims
- Validate token signature and expiration
- Support refresh token flow for expired tokens

### Ownership Verification
- Verify user owns favorite before allowing access or modification
- Check user_id matches authenticated user
- Return 404 Not Found (not 403 Forbidden) to prevent enumeration
- Share links bypass ownership check with valid token

### Rate Limiting
- 200 requests per hour per user for favorite operations
- 1000 requests per hour per user for read operations
- 10 share link generations per hour per user
- Include rate limit headers in responses (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset)

### Permissions
- Standard user role sufficient for all operations
- No elevated privileges required
- Admin users can view all favorites for support purposes (with audit logging)

## Error Handling

### Validation Errors (400 Bad Request)
```json
{
  "error": "ValidationError",
  "message": "Invalid request data",
  "details": [
    {
      "field": "vehicleId",
      "message": "Vehicle ID must be a valid UUID"
    }
  ]
}
```

### Authentication Errors (401 Unauthorized)
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired authentication token"
}
```

### Conflict Errors (409 Conflict)
```json
{
  "error": "DuplicateFavorite",
  "message": "Vehicle is already in your favorites"
}
```

### Rate Limit Errors (429 Too Many Requests)
```json
{
  "error": "RateLimitExceeded",
  "message": "Too many requests. Please try again later.",
  "retryAfter": 3600
}
```

### Server Errors (500 Internal Server Error)
```json
{
  "error": "InternalServerError",
  "message": "An unexpected error occurred",
  "requestId": "uuid-for-tracking"
}
```

### Graceful Degradation
- If price monitoring fails, retry on next cycle without alerting user
- If notification delivery fails, queue for retry (max 3 attempts)
- If vehicle data unavailable, return cached data with staleness indicator
- If external services down, disable affected features temporarily with user notification

## Performance Considerations

### Database Query Optimization
- Use indexed queries for user_id and vehicle_id lookups
- Implement efficient pagination with cursor-based approach for large datasets
- Use database connection pooling (min 10, max 100 connections)
- Optimize JOIN queries with proper indexes
- Use read replicas for alert processing and analytics queries

### API Response Time Targets
- GET /api/favorites: < 200ms (p95)
- POST /api/favorites: < 300ms (p95)
- DELETE /api/favorites: < 200ms (p95)
- GET /api/favorites/{vehicleId}/availability: < 500ms (p95)
- GET /api/favorites/shared/{token}: < 300ms (p95)

### Background Job Optimization
- Process favorites in batches of 100 for price monitoring
- Use parallel processing for independent favorites (max 10 concurrent)
- Implement job priority queue (active users checked first)
- Monitor job execution time and adjust batch size dynamically
- Use database read replicas for background job queries

### Caching Optimization
- Implement multi-level caching (memory + Redis)
- Use cache-aside pattern for frequently accessed data
- Implement cache warming for popular vehicles
- Monitor cache hit rates (target: > 80%)
- Implement cache stampede prevention with locking

## Technology Stack

- **Framework**: ASP.NET Core 8+ Web API
- **Language**: C# 12+
- **ORM**: Entity Framework Core 8+
- **Database**: MySQL 8.0+ with InnoDB
- **Caching**: Redis 7+ with StackExchange.Redis
- **Background Jobs**: Hangfire 1.8+
- **Email**: SendGrid API v3
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **Logging**: Serilog with structured logging
- **Monitoring**: Application Insights or Prometheus + Grafana
- **Testing**: xUnit, Moq, FluentAssertions

## Implementation Notes

### Price Monitoring Job Configuration
```csharp
// Configure Hangfire recurring job
RecurringJob.AddOrUpdate<PriceMonitoringService>(
    "price-monitoring",
    service => service.MonitorPricesAsync(),
    Cron.Hourly,
    new RecurringJobOptions { TimeZone = TimeZoneInfo.Utc }
);
```

### Notification Template Management
Store notification templates in database for easy updates. Support template variables: `{userName}`, `{vehicleName}`, `{oldPrice}`, `{newPrice}`, `{priceChange}`, `{bookingUrl}`. Implement A/B testing for notification content optimization.

### Alert Deduplication
Prevent duplicate alerts within 24-hour window. Track last alert sent per favorite and alert type. Skip alert generation if similar alert sent recently. Implement smart batching for multiple price changes.

### Monitoring and Alerting
- Monitor price monitoring job success rate (target: > 99%)
- Monitor notification delivery rate (target: > 95%)
- Monitor API response times and error rates
- Alert on high error rates (> 1%) or slow response times (> 1s p95)
- Track favorite creation and deletion trends
- Monitor cache hit rates and performance

### Testing Strategy
- Unit tests for business logic (favorite validation, price change calculation)
- Integration tests for API endpoints with in-memory database
- Background job tests with mocked time and external services
- Notification delivery tests with mocked SendGrid and FCM
- Load tests for concurrent favorite operations (target: 1000 req/s)
- End-to-end tests for critical user flows

### Security Best Practices
- Sanitize all user input to prevent injection attacks
- Use parameterized queries for all database operations
- Implement CORS policies for frontend access
- Use HTTPS for all API communication
- Rotate share link tokens periodically
- Implement audit logging for sensitive operations (bulk delete, share creation)
- Hash passwords for protected shares using bcrypt
- Implement request signing for webhook callbacks

### Scalability Considerations
- Design for horizontal scaling of API instances (stateless)
- Use distributed caching (Redis) for multi-instance deployments
- Implement database read replicas for read-heavy operations
- Consider message queue (RabbitMQ, Azure Service Bus) for high-volume notifications
- Partition favorites by user ID for database sharding if needed
- Implement circuit breaker pattern for external service calls
- Use CDN for static assets and vehicle images

### Error Recovery
- Implement dead letter queue for failed notifications
- Automatic retry with exponential backoff for transient failures
- Manual intervention queue for persistent failures
- Comprehensive error logging with correlation IDs
- Health check endpoints for monitoring service status
