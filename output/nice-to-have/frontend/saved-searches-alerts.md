# Feature: Saved Searches & Alerts

## Overview

The Saved Searches & Alerts feature enables users to save frequently used search criteria with custom names and receive automated notifications when matching vehicles become available or when prices drop. This feature is particularly valuable for power renters, frequent travelers, and users planning future trips who want to monitor the market without repeatedly performing manual searches.

## Sprint Category

nice-to-have

## Feature ID

F-SD-013

## User Stories

### As a frequent business traveler
I want to save my common search criteria (e.g., "LAX SUV weekends"), so that I can quickly find vehicles for my regular trips without re-entering filters each time.

### As a budget-conscious renter
I want to receive price drop alerts for my saved searches, so that I can book when rates are most favorable and maximize my savings.

### As a vacation planner
I want to be notified when vehicles matching my criteria become available, so that I don't miss out on my preferred vehicle types during peak travel seasons.

### As a power user
I want to manage multiple saved searches with descriptive names, so that I can monitor different trip scenarios simultaneously (family vacation, business trip, weekend getaway).

### As a collaborative traveler
I want to share my saved searches with travel companions, so that we can coordinate vehicle selection and booking decisions together.

## Frontend Specifications

### Pages

**Saved Searches Dashboard** (`/account/saved-searches`)
- List view of all saved searches with custom names
- Quick access buttons to execute each saved search
- Edit and delete controls for each saved search
- Create new saved search button
- Search history section showing recent searches

**Search Results Page** (`/search`)
- "Save this search" button prominently displayed
- Modal dialog for naming and configuring saved search
- Alert preferences configuration (price drops, availability)
- Notification channel selection (email, push, SMS)

**Account Settings - Notifications** (`/account/settings/notifications`)
- Saved search alert preferences
- Notification frequency settings (instant, daily digest, weekly)
- Channel preferences per saved search
- Quiet hours configuration

### UI Components

**SavedSearchCard Component**
- Display saved search name and summary of criteria
- Last executed timestamp
- Number of current matches indicator
- Quick action buttons: Execute, Edit, Delete, Share
- Alert status indicator (active/paused)
- Visual badge for new matches or price drops

**SaveSearchModal Component**
- Input field for custom search name
- Summary of current search criteria (read-only)
- Alert configuration toggles:
  - Price drop alerts (with threshold percentage)
  - New availability alerts
  - Specific vehicle availability
- Notification channel checkboxes (email, push, SMS)
- Save and Cancel buttons

**SearchCriteriaSummary Component**
- Compact display of search parameters
- Location, dates, vehicle type, filters
- Edit criteria link
- Used in saved search cards and notifications

**AlertNotification Component**
- In-app notification banner for saved search matches
- Dismissible with "View Results" CTA
- Shows search name and match count
- Price drop percentage if applicable

**ShareSearchModal Component**
- Generate shareable link for saved search
- Copy to clipboard functionality
- Email invitation form
- Social media sharing buttons
- QR code generation for mobile sharing

### User Flows

**Save a Search Flow**
1. User performs a vehicle search with specific criteria
2. User clicks "Save this search" button on results page
3. Modal opens prompting for search name
4. User enters descriptive name (e.g., "NYC SUV July 4th weekend")
5. User configures alert preferences (price drops, availability)
6. User selects notification channels (email, push)
7. User clicks "Save" button
8. System saves search and displays confirmation
9. User is redirected to saved searches dashboard

**Execute Saved Search Flow**
1. User navigates to saved searches dashboard
2. User clicks on a saved search card
3. System loads search criteria and executes search
4. User is redirected to search results page with criteria applied
5. Results display with indication that this is a saved search
6. User can modify criteria and update saved search if desired

**Receive Alert Flow**
1. System detects price drop or new availability for saved search
2. System generates notification based on user preferences
3. User receives email/push notification with search name and details
4. User clicks notification link
5. User is directed to search results page with matching vehicles
6. User can proceed to booking or dismiss notification

**Manage Saved Searches Flow**
1. User navigates to saved searches dashboard
2. User views list of all saved searches
3. User can edit search name or alert preferences
4. User can pause/resume alerts for specific searches
5. User can delete searches no longer needed
6. User can view search history and past executions

**Share Saved Search Flow**
1. User clicks "Share" button on saved search card
2. Share modal opens with multiple sharing options
3. User selects sharing method (link, email, social)
4. System generates shareable link with search criteria
5. Recipient clicks link and views search results
6. Recipient can optionally save the search to their own account

### Data Requirements

**From Backend API**
- User's saved searches list with metadata
- Search execution results for saved criteria
- Alert history and notification log
- Match count for each saved search
- Price change data for monitored searches
- Availability status for monitored vehicles

**State Management**
- Current user's saved searches collection
- Active alerts and notification preferences
- Search execution history
- Pending notifications count
- Share link generation and tracking

## Backend Specifications

### API Endpoints

**POST /api/saved-searches**
- Create a new saved search
- Request body: search criteria, name, alert preferences
- Returns: saved search object with unique ID
- Authentication: Required (JWT)

**GET /api/saved-searches**
- Retrieve all saved searches for authenticated user
- Query parameters: sort, filter, pagination
- Returns: array of saved search objects
- Authentication: Required (JWT)

**GET /api/saved-searches/{id}**
- Retrieve specific saved search details
- Returns: saved search object with full criteria
- Authentication: Required (JWT, owner only)

**PUT /api/saved-searches/{id}**
- Update saved search name or alert preferences
- Request body: updated fields
- Returns: updated saved search object
- Authentication: Required (JWT, owner only)

**DELETE /api/saved-searches/{id}**
- Delete a saved search
- Returns: 204 No Content
- Authentication: Required (JWT, owner only)

**POST /api/saved-searches/{id}/execute**
- Execute a saved search and return results
- Returns: vehicle search results matching criteria
- Updates last_executed timestamp
- Authentication: Required (JWT, owner only)

**GET /api/saved-searches/{id}/matches**
- Get current match count without full execution
- Returns: count and summary of matching vehicles
- Authentication: Required (JWT, owner only)

**POST /api/saved-searches/{id}/share**
- Generate shareable link for saved search
- Request body: sharing options (expiration, permissions)
- Returns: shareable URL and metadata
- Authentication: Required (JWT, owner only)

**GET /api/saved-searches/shared/{token}**
- Access shared saved search via token
- Returns: search criteria and results
- Authentication: Optional (public access with valid token)

**POST /api/saved-searches/{id}/alerts/pause**
- Pause alerts for specific saved search
- Returns: updated saved search object
- Authentication: Required (JWT, owner only)

**POST /api/saved-searches/{id}/alerts/resume**
- Resume alerts for specific saved search
- Returns: updated saved search object
- Authentication: Required (JWT, owner only)

### Request Schemas

**CreateSavedSearchRequest**
```
{
  "name": "string (required, 1-100 characters)",
  "searchCriteria": {
    "pickupLocationId": "string (required)",
    "returnLocationId": "string (optional)",
    "pickupDate": "ISO 8601 datetime (required)",
    "returnDate": "ISO 8601 datetime (required)",
    "vehicleType": "string (optional)",
    "filters": {
      "transmission": "string (optional)",
      "fuelType": "string (optional)",
      "minSeats": "integer (optional)",
      "maxPrice": "decimal (optional)",
      "features": "array of strings (optional)"
    }
  },
  "alertPreferences": {
    "priceDropEnabled": "boolean (default: false)",
    "priceDropThreshold": "decimal (optional, percentage)",
    "availabilityAlertEnabled": "boolean (default: true)",
    "notificationChannels": "array of strings (email, push, sms)"
  }
}
```

**UpdateSavedSearchRequest**
```
{
  "name": "string (optional, 1-100 characters)",
  "alertPreferences": {
    "priceDropEnabled": "boolean (optional)",
    "priceDropThreshold": "decimal (optional)",
    "availabilityAlertEnabled": "boolean (optional)",
    "notificationChannels": "array of strings (optional)"
  }
}
```

**ShareSavedSearchRequest**
```
{
  "expirationDays": "integer (optional, default: 30)",
  "allowModification": "boolean (optional, default: false)",
  "recipientEmail": "string (optional)"
}
```

### Response Schemas

**SavedSearchResponse**
```
{
  "id": "string (UUID)",
  "userId": "string (UUID)",
  "name": "string",
  "searchCriteria": {
    "pickupLocationId": "string",
    "pickupLocationName": "string",
    "returnLocationId": "string",
    "returnLocationName": "string",
    "pickupDate": "ISO 8601 datetime",
    "returnDate": "ISO 8601 datetime",
    "vehicleType": "string",
    "filters": "object"
  },
  "alertPreferences": {
    "priceDropEnabled": "boolean",
    "priceDropThreshold": "decimal",
    "availabilityAlertEnabled": "boolean",
    "notificationChannels": "array of strings",
    "isPaused": "boolean"
  },
  "metadata": {
    "createdAt": "ISO 8601 datetime",
    "lastExecuted": "ISO 8601 datetime",
    "executionCount": "integer",
    "currentMatchCount": "integer",
    "lastNotificationSent": "ISO 8601 datetime"
  }
}
```

**SavedSearchMatchesResponse**
```
{
  "savedSearchId": "string (UUID)",
  "matchCount": "integer",
  "priceRange": {
    "min": "decimal",
    "max": "decimal",
    "average": "decimal"
  },
  "availabilityStatus": "string (available, limited, unavailable)",
  "priceChangePercentage": "decimal (optional)",
  "lastChecked": "ISO 8601 datetime"
}
```

**ShareLinkResponse**
```
{
  "shareUrl": "string (full URL)",
  "token": "string",
  "expiresAt": "ISO 8601 datetime",
  "createdAt": "ISO 8601 datetime"
}
```

### Business Logic

**Search Criteria Validation**
- Validate all search criteria before saving
- Ensure pickup date is in the future
- Ensure return date is after pickup date
- Validate location IDs exist in system
- Validate filter values against allowed options
- Enforce maximum of 20 saved searches per user

**Alert Processing**
- Background job runs every 15 minutes to check saved searches
- Compare current vehicle availability and pricing against saved criteria
- Detect price drops exceeding user-defined threshold
- Detect new vehicle availability matching criteria
- Generate notifications based on user preferences
- Respect notification frequency limits (max 1 per search per day)
- Honor quiet hours configuration (no notifications 10 PM - 8 AM local time)

**Price Drop Detection**
- Track historical pricing for vehicles matching search criteria
- Calculate percentage change from baseline price
- Trigger alert when drop exceeds threshold (e.g., 10%, 20%)
- Include comparison pricing in notification

**Availability Monitoring**
- Check vehicle availability for saved search date ranges
- Detect newly available vehicles matching criteria
- Detect when previously unavailable vehicles become available
- Track availability changes over time

**Search Execution Optimization**
- Cache search results for 5 minutes to reduce database load
- Update last_executed timestamp on each execution
- Increment execution_count for analytics
- Log search execution for user history

**Share Link Management**
- Generate unique, non-guessable tokens for shared searches
- Set expiration dates based on user preference (default 30 days)
- Track share link usage and analytics
- Automatically clean up expired share links
- Optionally require authentication to view shared searches

### Authentication Requirements

**Required for All Endpoints**: JWT token in Authorization header
**Ownership Validation**: User can only access their own saved searches
**Share Link Access**: Public access with valid token, optional authentication for enhanced features
**Rate Limiting**: 100 requests per hour per user for saved search operations
**Permissions**: Standard user role sufficient, no elevated privileges required

## Database Specifications

### Schema Changes

**New Table: saved_searches**
- Primary table for storing user saved searches
- Includes search criteria as JSON
- Tracks alert preferences and metadata

**New Table: saved_search_alerts**
- Stores alert history and notification log
- Tracks when alerts were sent and user interactions

**New Table: saved_search_shares**
- Manages shared search links and permissions
- Tracks share link usage and expiration

**New Table: saved_search_executions**
- Logs each time a saved search is executed
- Stores execution results for analytics

### Table Definitions

**saved_searches**
```
id                      VARCHAR(36) PRIMARY KEY (UUID)
user_id                 VARCHAR(36) NOT NULL (FK to users.id)
name                    VARCHAR(100) NOT NULL
search_criteria         JSON NOT NULL
alert_preferences       JSON NOT NULL
is_paused               BOOLEAN DEFAULT FALSE
created_at              DATETIME NOT NULL
updated_at              DATETIME NOT NULL
last_executed_at        DATETIME NULL
execution_count         INT DEFAULT 0
current_match_count     INT DEFAULT 0
last_notification_sent  DATETIME NULL

INDEX idx_user_id (user_id)
INDEX idx_created_at (created_at)
INDEX idx_last_executed (last_executed_at)
```

**saved_search_alerts**
```
id                  VARCHAR(36) PRIMARY KEY (UUID)
saved_search_id     VARCHAR(36) NOT NULL (FK to saved_searches.id)
alert_type          ENUM('price_drop', 'availability', 'new_match') NOT NULL
notification_channel ENUM('email', 'push', 'sms') NOT NULL
sent_at             DATETIME NOT NULL
opened_at           DATETIME NULL
clicked_at          DATETIME NULL
alert_data          JSON NOT NULL
status              ENUM('sent', 'delivered', 'failed', 'bounced') NOT NULL

INDEX idx_saved_search_id (saved_search_id)
INDEX idx_sent_at (sent_at)
INDEX idx_alert_type (alert_type)
```

**saved_search_shares**
```
id                  VARCHAR(36) PRIMARY KEY (UUID)
saved_search_id     VARCHAR(36) NOT NULL (FK to saved_searches.id)
share_token         VARCHAR(64) UNIQUE NOT NULL
created_by_user_id  VARCHAR(36) NOT NULL (FK to users.id)
created_at          DATETIME NOT NULL
expires_at          DATETIME NOT NULL
allow_modification  BOOLEAN DEFAULT FALSE
access_count        INT DEFAULT 0
last_accessed_at    DATETIME NULL

INDEX idx_share_token (share_token)
INDEX idx_saved_search_id (saved_search_id)
INDEX idx_expires_at (expires_at)
```

**saved_search_executions**
```
id                  VARCHAR(36) PRIMARY KEY (UUID)
saved_search_id     VARCHAR(36) NOT NULL (FK to saved_searches.id)
executed_by_user_id VARCHAR(36) NOT NULL (FK to users.id)
executed_at         DATETIME NOT NULL
match_count         INT NOT NULL
execution_time_ms   INT NOT NULL
result_summary      JSON NULL

INDEX idx_saved_search_id (saved_search_id)
INDEX idx_executed_at (executed_at)
```

### Relationships

**saved_searches → users**
- Many-to-one relationship
- Foreign key: user_id references users.id
- Cascade delete: When user is deleted, all saved searches are deleted

**saved_search_alerts → saved_searches**
- Many-to-one relationship
- Foreign key: saved_search_id references saved_searches.id
- Cascade delete: When saved search is deleted, all alerts are deleted

**saved_search_shares → saved_searches**
- Many-to-one relationship
- Foreign key: saved_search_id references saved_searches.id
- Cascade delete: When saved search is deleted, all shares are deleted

**saved_search_shares → users**
- Many-to-one relationship
- Foreign key: created_by_user_id references users.id
- No cascade: Shares remain for audit trail even if user is deleted

**saved_search_executions → saved_searches**
- Many-to-one relationship
- Foreign key: saved_search_id references saved_searches.id
- Cascade delete: When saved search is deleted, execution history is deleted

**saved_search_executions → users**
- Many-to-one relationship
- Foreign key: executed_by_user_id references users.id
- No cascade: Execution logs remain for analytics even if user is deleted

### Indexes

**Performance Optimization Indexes**
- `idx_user_id` on saved_searches: Fast retrieval of user's saved searches
- `idx_created_at` on saved_searches: Sorting by creation date
- `idx_last_executed` on saved_searches: Finding stale searches for cleanup
- `idx_saved_search_id` on saved_search_alerts: Fast alert history lookup
- `idx_sent_at` on saved_search_alerts: Alert analytics and reporting
- `idx_alert_type` on saved_search_alerts: Filtering alerts by type
- `idx_share_token` on saved_search_shares: Fast share link resolution
- `idx_expires_at` on saved_search_shares: Cleanup of expired shares
- `idx_executed_at` on saved_search_executions: Execution history queries

**Composite Indexes**
- `idx_user_paused` on saved_searches (user_id, is_paused): Active searches per user
- `idx_alert_status` on saved_search_alerts (saved_search_id, status, sent_at): Alert delivery tracking

## Technology Stack

- **Backend**: .NET 8+ with C#, ASP.NET Core Web API, Entity Framework Core
- **Database**: MySQL 8.0+ with InnoDB storage engine
- **Frontend**: Next.js 14+ with React 18+, TypeScript, Tailwind CSS
- **Background Jobs**: Hangfire or Quartz.NET for alert processing
- **Notifications**: SendGrid (email), Firebase Cloud Messaging (push), Twilio (SMS)
- **Caching**: Redis for search result caching

## Implementation Notes

### Alert Processing Strategy
Implement a background job that runs every 15 minutes to check all active (non-paused) saved searches. Use batch processing to minimize database queries and API calls. Consider implementing a priority queue where searches with higher execution frequency or more active users are checked more frequently.

### Notification Throttling
Implement rate limiting to prevent notification fatigue. Limit to one notification per saved search per day unless user explicitly opts for real-time alerts. Provide daily or weekly digest options for users who want less frequent updates.

### Search Criteria Storage
Store search criteria as JSON in the database for flexibility. This allows adding new filter types without schema changes. Validate JSON structure on save and load to ensure data integrity.

### Performance Considerations
Cache frequently executed saved searches to reduce database load. Implement pagination for users with many saved searches. Consider archiving old, unused saved searches after 6 months of inactivity.

### Privacy and Security
Ensure saved searches are only accessible by the owning user. Implement secure token generation for share links using cryptographically secure random generators. Set reasonable expiration dates for share links to limit exposure.

### Analytics and Insights
Track saved search usage patterns to understand user behavior. Identify popular search criteria to inform inventory management and pricing strategies. Monitor alert effectiveness (open rates, click-through rates) to optimize notification content.

### Mobile Optimization
Ensure saved searches dashboard is fully responsive and touch-friendly. Implement pull-to-refresh for updating match counts. Support deep linking from notifications directly to search results.

### Future Enhancements
- Machine learning to predict optimal booking times based on saved search patterns
- Smart alerts that learn user preferences and adjust notification timing
- Collaborative saved searches for group travel planning
- Integration with calendar apps for automatic search execution based on travel dates
- Voice assistant integration for hands-free saved search management
