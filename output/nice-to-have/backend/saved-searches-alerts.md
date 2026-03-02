# Feature: Saved Searches & Alerts (Backend)

## Overview

Backend implementation for the Saved Searches & Alerts feature, providing RESTful API endpoints for managing user saved searches, executing search criteria, processing automated alerts, and generating shareable search links. This backend service handles search persistence, alert scheduling, notification delivery, and analytics tracking.

## Sprint Category

nice-to-have

## Feature ID

F-SD-013

## API Endpoints

### Saved Search Management

**POST /api/saved-searches**
- Create new saved search with criteria and alert preferences
- Validates search criteria and user limits (max 20 per user)
- Returns created saved search with unique ID
- Status codes: 201 Created, 400 Bad Request, 401 Unauthorized, 429 Too Many Requests

**GET /api/saved-searches**
- Retrieve all saved searches for authenticated user
- Supports sorting (created_at, last_executed, name) and pagination
- Returns array of saved search objects with metadata
- Status codes: 200 OK, 401 Unauthorized

**GET /api/saved-searches/{id}**
- Retrieve specific saved search with full details
- Includes search criteria, alert preferences, and execution history
- Status codes: 200 OK, 401 Unauthorized, 404 Not Found

**PUT /api/saved-searches/{id}**
- Update saved search name or alert preferences
- Partial updates supported (only changed fields required)
- Status codes: 200 OK, 400 Bad Request, 401 Unauthorized, 404 Not Found

**DELETE /api/saved-searches/{id}**
- Soft delete saved search (mark as deleted, retain for audit)
- Cancels all pending alerts for the search
- Status codes: 204 No Content, 401 Unauthorized, 404 Not Found

### Search Execution

**POST /api/saved-searches/{id}/execute**
- Execute saved search and return matching vehicles
- Updates last_executed timestamp and execution_count
- Logs execution for analytics
- Status codes: 200 OK, 401 Unauthorized, 404 Not Found

**GET /api/saved-searches/{id}/matches**
- Get current match count without full search execution
- Lightweight endpoint for dashboard updates
- Status codes: 200 OK, 401 Unauthorized, 404 Not Found

### Alert Management

**POST /api/saved-searches/{id}/alerts/pause**
- Pause alert notifications for specific saved search
- Retains search but stops background monitoring
- Status codes: 200 OK, 401 Unauthorized, 404 Not Found

**POST /api/saved-searches/{id}/alerts/resume**
- Resume alert notifications for paused saved search
- Resumes background monitoring and notifications
- Status codes: 200 OK, 401 Unauthorized, 404 Not Found

**GET /api/saved-searches/{id}/alerts/history**
- Retrieve alert history for specific saved search
- Includes sent, delivered, opened, and clicked events
- Supports pagination and date range filtering
- Status codes: 200 OK, 401 Unauthorized, 404 Not Found

### Sharing

**POST /api/saved-searches/{id}/share**
- Generate shareable link with unique token
- Configurable expiration and permissions
- Optionally send email invitation to recipient
- Status codes: 201 Created, 401 Unauthorized, 404 Not Found

**GET /api/saved-searches/shared/{token}**
- Access shared saved search via public token
- Returns search criteria and executes search
- Tracks access count and last accessed timestamp
- Status codes: 200 OK, 404 Not Found, 410 Gone (expired)

**DELETE /api/saved-searches/{id}/share/{shareId}**
- Revoke shared link before expiration
- Prevents further access via token
- Status codes: 204 No Content, 401 Unauthorized, 404 Not Found

## Business Logic

### Search Criteria Validation
- Validate pickup and return locations exist in system
- Ensure pickup date is at least 1 hour in the future
- Ensure return date is after pickup date
- Validate minimum rental duration (typically 1 hour)
- Validate maximum rental duration (typically 90 days)
- Validate filter values against allowed enumerations
- Enforce user limit of 20 saved searches maximum

### Alert Processing Engine
- Background job runs every 15 minutes using Hangfire
- Queries all active (non-paused) saved searches
- Executes search criteria against current vehicle inventory
- Compares results with previous execution baseline
- Detects price drops exceeding user threshold
- Detects new vehicle availability
- Generates notifications based on user preferences
- Respects notification frequency limits
- Honors quiet hours (10 PM - 8 AM user local time)

### Price Drop Detection Algorithm
```
1. Retrieve baseline pricing from previous execution
2. Execute current search and get current pricing
3. For each matching vehicle:
   a. Calculate price change percentage
   b. If drop >= user threshold (e.g., 10%):
      - Add to price drop alert list
4. If any price drops detected:
   a. Generate notification with details
   b. Send via user-preferred channels
   c. Log alert in saved_search_alerts table
```

### Availability Monitoring
```
1. Retrieve previous match count and vehicle IDs
2. Execute current search and get current matches
3. Identify newly available vehicles (not in previous results)
4. If new vehicles found:
   a. Generate availability notification
   b. Include vehicle details and count
   c. Send via user-preferred channels
   d. Log alert in saved_search_alerts table
```

### Notification Delivery
- Email notifications via SendGrid API
- Push notifications via Firebase Cloud Messaging
- SMS notifications via Twilio API (optional)
- Notification content includes:
  - Saved search name
  - Match count or price drop details
  - Direct link to search results
  - Unsubscribe/pause alerts link
- Track delivery status and user interactions
- Implement retry logic for failed deliveries (max 3 attempts)

### Search Execution Optimization
- Cache search results for 5 minutes using Redis
- Use cache key: `saved_search:{id}:results:{hash(criteria)}`
- Return cached results if available and fresh
- Update last_executed timestamp on cache miss
- Increment execution_count for analytics
- Log execution time for performance monitoring

### Share Link Security
- Generate cryptographically secure random tokens (64 characters)
- Use URL-safe base64 encoding
- Set default expiration to 30 days
- Validate token on each access attempt
- Track access count and last accessed timestamp
- Automatically clean up expired shares (daily job)
- Rate limit share link access (100 requests per hour per token)

### User Limits and Quotas
- Maximum 20 saved searches per user
- Maximum 5 share links per saved search
- Maximum 100 alert notifications per day per user
- Maximum 1000 search executions per day per user
- Enforce limits with clear error messages

## Authentication and Authorization

### JWT Token Validation
- All endpoints require valid JWT token in Authorization header
- Token must contain user ID claim
- Token expiration validated on each request
- Refresh token flow supported for expired tokens

### Ownership Verification
- Verify user owns saved search before allowing access
- Check user_id matches authenticated user
- Return 404 Not Found (not 403 Forbidden) to prevent enumeration
- Share links bypass ownership check with valid token

### Rate Limiting
- 100 requests per hour per user for saved search operations
- 1000 requests per hour per user for search execution
- 10 share link generations per hour per user
- Rate limit headers included in responses (X-RateLimit-*)

### Permissions
- Standard user role sufficient for all operations
- No elevated privileges required
- Admin users can view all saved searches for support purposes

## Error Handling

### Validation Errors (400 Bad Request)
- Invalid search criteria format
- Missing required fields
- Invalid date ranges
- Exceeded user limits
- Invalid filter values

### Authentication Errors (401 Unauthorized)
- Missing or invalid JWT token
- Expired token without refresh
- Revoked or blacklisted token

### Authorization Errors (404 Not Found)
- Saved search not found or not owned by user
- Use 404 instead of 403 to prevent enumeration

### Rate Limiting (429 Too Many Requests)
- Exceeded request rate limits
- Include Retry-After header with seconds to wait

### Server Errors (500 Internal Server Error)
- Database connection failures
- External service failures (SendGrid, FCM, Twilio)
- Unexpected exceptions
- Log detailed error information for debugging

### Graceful Degradation
- If alert processing fails, retry on next cycle
- If notification delivery fails, queue for retry
- If search execution times out, return cached results if available
- If external services unavailable, disable affected features temporarily

## Performance Considerations

### Database Query Optimization
- Use indexed queries for user_id and saved_search_id lookups
- Implement pagination for large result sets
- Use database connection pooling
- Optimize JSON column queries with generated columns for frequently accessed fields

### Caching Strategy
- Cache search results for 5 minutes
- Cache user's saved searches list for 1 minute
- Cache location and vehicle data for 15 minutes
- Use Redis for distributed caching across API instances
- Implement cache invalidation on data updates

### Background Job Optimization
- Process saved searches in batches of 100
- Use parallel processing for independent searches
- Implement job priority queue (active users first)
- Monitor job execution time and adjust batch size
- Use database read replicas for alert processing queries

### API Response Time Targets
- GET endpoints: < 200ms (p95)
- POST/PUT endpoints: < 500ms (p95)
- Search execution: < 2000ms (p95)
- Share link access: < 300ms (p95)

## Technology Stack

- **Framework**: ASP.NET Core 8+ Web API
- **Language**: C# 12+
- **ORM**: Entity Framework Core 8+
- **Database**: MySQL 8.0+ with InnoDB
- **Caching**: Redis 7+
- **Background Jobs**: Hangfire 1.8+
- **Email**: SendGrid API
- **Push Notifications**: Firebase Cloud Messaging
- **SMS**: Twilio API (optional)
- **Logging**: Serilog with structured logging
- **Monitoring**: Application Insights or Prometheus

## Implementation Notes

### Alert Processing Job Configuration
Configure Hangfire recurring job to run every 15 minutes. Use CRON expression: `*/15 * * * *`. Implement job locking to prevent concurrent executions. Monitor job execution time and alert if exceeds 10 minutes.

### Notification Template Management
Store notification templates in database for easy updates without deployment. Support template variables for personalization (user name, search name, match count, price drop percentage). Implement A/B testing for notification content optimization.

### Search Criteria Evolution
Design search_criteria JSON schema to support versioning. When adding new filter types, maintain backward compatibility. Implement migration logic for old saved searches when criteria schema changes.

### Monitoring and Alerting
- Monitor alert processing job success rate (target: > 99%)
- Monitor notification delivery rate (target: > 95%)
- Monitor API response times and error rates
- Alert on high error rates or slow response times
- Track saved search creation and execution trends

### Testing Strategy
- Unit tests for business logic and validation
- Integration tests for API endpoints
- Background job tests with mocked time
- Notification delivery tests with mocked external services
- Load tests for alert processing at scale

### Security Best Practices
- Sanitize user input to prevent injection attacks
- Use parameterized queries for all database operations
- Implement CORS policies for frontend access
- Use HTTPS for all API communication
- Rotate share link tokens periodically
- Implement audit logging for sensitive operations

### Scalability Considerations
- Design for horizontal scaling of API instances
- Use distributed caching (Redis) for multi-instance deployments
- Implement database read replicas for alert processing
- Consider message queue (RabbitMQ, Azure Service Bus) for high-volume notifications
- Partition saved searches by user ID for database sharding if needed
