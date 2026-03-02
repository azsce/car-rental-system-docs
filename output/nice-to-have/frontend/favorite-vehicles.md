# Feature: Favorite Vehicles

## Overview

The Favorite Vehicles feature allows users to save specific vehicles to a favorites list for quick access and monitoring. Users receive notifications when their favorite vehicles become available for their desired dates or when prices change. This feature enhances user experience by enabling easy tracking of preferred vehicles and ensuring users don't miss booking opportunities.

## Sprint Category

nice-to-have

## Feature ID

F-SD-014

## Dependencies

- F-SD-009: Comprehensive Vehicle Details (must exist to favorite vehicles)
- R-UM-005: User authentication and profile management
- R-VS-009: Vehicle availability checking

## User Stories

### As a returning customer
I want to save my favorite vehicles from previous rentals, so that I can quickly find and book the same vehicles for future trips.

### As a vehicle enthusiast
I want to maintain a list of interesting vehicles I've discovered, so that I can compare them and choose the best option when I'm ready to book.

### As a deal hunter
I want to receive price drop alerts for my favorite vehicles, so that I can book when rates are most favorable.

### As a planner
I want to be notified when my favorite vehicles become available for my travel dates, so that I don't miss out on my preferred vehicles during peak seasons.

### As a collaborative traveler
I want to share my favorite vehicles with travel companions, so that we can discuss and agree on vehicle selection together.

## Frontend Specifications

### Pages

**Favorites Dashboard** (`/account/favorites`)
- Grid or list view of all favorited vehicles
- Vehicle cards with key details (image, name, price, rating)
- Quick action buttons: View Details, Check Availability, Remove
- Filter and sort options (price, rating, date added)
- Empty state with suggestions when no favorites exist
- Bulk actions (remove multiple, compare selected)

**Vehicle Details Page** (`/vehicles/{id}`)
- "Add to Favorites" heart icon button (prominent placement)
- Visual indication if vehicle is already favorited (filled heart)
- Quick toggle to add/remove from favorites
- Toast notification on favorite add/remove

**Search Results Page** (`/search`)
- Heart icon on each vehicle card for quick favoriting
- Visual badge indicating favorited vehicles
- Filter option to show only favorited vehicles in results

**Account Settings - Notifications** (`/account/settings/notifications`)
- Favorite vehicle alert preferences
- Price change notification settings (threshold percentage)
- Availability notification settings
- Notification channel preferences (email, push)

### UI Components

**FavoriteButton Component**
- Heart icon that toggles between outlined and filled states
- Animated transition on click (scale, color change)
- Loading state during API call
- Tooltip showing "Add to favorites" or "Remove from favorites"
- Optimistic UI update with rollback on error
- Accessible with keyboard navigation and ARIA labels

**FavoriteVehicleCard Component**
- Vehicle thumbnail image with overlay heart icon
- Vehicle name, category, and key specifications
- Current price with price change indicator (up/down arrow)
- Availability status badge (available, limited, unavailable)
- Last price check timestamp
- Quick action buttons: View Details, Check Availability, Remove
- Responsive design for mobile and desktop

**FavoritesList Component**
- Container for favorite vehicle cards
- Grid or list view toggle
- Sort dropdown (date added, price, rating, name)
- Filter options (vehicle type, availability, price range)
- Pagination or infinite scroll for large lists
- Bulk selection mode with checkboxes
- Empty state with call-to-action to browse vehicles

**PriceChangeAlert Component**
- In-app notification banner for price changes
- Shows vehicle name, old price, new price, percentage change
- "View Vehicle" call-to-action button
- Dismissible with close button
- Color-coded (green for price drop, red for price increase)

**AvailabilityAlert Component**
- In-app notification for availability changes
- Shows vehicle name and availability status
- "Check Dates" call-to-action button
- Dismissible notification
- Badge indicating new availability

**ShareFavoritesModal Component**
- Generate shareable link for favorites list
- Copy to clipboard functionality
- Email invitation form with message
- Social media sharing buttons
- QR code generation for mobile sharing
- Privacy options (public, private with password)

### User Flows

**Add Vehicle to Favorites Flow**
1. User browses vehicles (search results or vehicle details page)
2. User clicks heart icon on vehicle card or details page
3. System validates user is authenticated (redirect to login if not)
4. System adds vehicle to user's favorites
5. Heart icon fills with color (animated transition)
6. Toast notification confirms "Added to favorites"
7. Favorites count badge updates in navigation

**Remove Vehicle from Favorites Flow**
1. User navigates to favorites dashboard or views favorited vehicle
2. User clicks filled heart icon or "Remove" button
3. Confirmation modal appears (optional, configurable)
4. User confirms removal
5. System removes vehicle from favorites
6. Vehicle card fades out and is removed from list
7. Toast notification confirms "Removed from favorites"

**Receive Price Alert Flow**
1. System detects price change for favorited vehicle
2. System generates notification based on user preferences
3. User receives email/push notification with price details
4. User clicks notification link
5. User is directed to vehicle details page
6. Price change is highlighted with comparison
7. User can proceed to booking or dismiss notification

**Check Favorite Availability Flow**
1. User navigates to favorites dashboard
2. User clicks "Check Availability" on vehicle card
3. Date picker modal opens with user's preferred dates (if saved)
4. User selects pickup and return dates
5. System checks real-time availability
6. Availability status displays (available, limited, unavailable)
7. If available, "Book Now" button appears
8. User can proceed to booking or close modal

**Share Favorites Flow**
1. User navigates to favorites dashboard
2. User clicks "Share Favorites" button
3. Share modal opens with sharing options
4. User selects sharing method (link, email, social)
5. System generates shareable link with favorites list
6. User copies link or sends invitation
7. Recipient clicks link and views favorites list
8. Recipient can optionally save vehicles to their own favorites

### Data Requirements

**From Backend API**
- User's favorited vehicles list with metadata
- Vehicle details (name, image, price, rating, availability)
- Price history for favorited vehicles
- Availability status for user's preferred dates
- Alert history and notification preferences
- Share link generation and tracking

**State Management**
- Current user's favorites collection
- Favorite status for each vehicle (for quick lookup)
- Active price and availability alerts
- Pending notifications count
- Share link metadata

**Local Storage**
- Temporary favorites for unauthenticated users
- Recently viewed vehicles
- Preferred date ranges for availability checks

## Backend Specifications

### API Endpoints

**POST /api/favorites**
- Add vehicle to user's favorites
- Request body: vehicleId, optional notes
- Returns: favorite object with metadata
- Authentication: Required (JWT)

**GET /api/favorites**
- Retrieve all favorited vehicles for authenticated user
- Query parameters: sort, filter, pagination
- Returns: array of favorite objects with vehicle details
- Authentication: Required (JWT)

**GET /api/favorites/{vehicleId}**
- Check if specific vehicle is favorited by user
- Returns: favorite status and metadata
- Authentication: Required (JWT)

**DELETE /api/favorites/{vehicleId}**
- Remove vehicle from user's favorites
- Returns: 204 No Content
- Authentication: Required (JWT)

**GET /api/favorites/{vehicleId}/availability**
- Check availability for favorited vehicle
- Query parameters: pickupDate, returnDate, locationId
- Returns: availability status and pricing
- Authentication: Required (JWT)

**POST /api/favorites/{vehicleId}/alerts**
- Configure alerts for specific favorite vehicle
- Request body: alert preferences (price, availability)
- Returns: alert configuration object
- Authentication: Required (JWT)

**GET /api/favorites/alerts/history**
- Retrieve alert history for user's favorites
- Query parameters: pagination, date range
- Returns: array of alert events
- Authentication: Required (JWT)

**POST /api/favorites/share**
- Generate shareable link for favorites list
- Request body: sharing options (expiration, privacy)
- Returns: shareable URL and metadata
- Authentication: Required (JWT)

**GET /api/favorites/shared/{token}**
- Access shared favorites list via token
- Returns: array of vehicles from shared list
- Authentication: Optional (public access with valid token)

**POST /api/favorites/bulk**
- Add multiple vehicles to favorites at once
- Request body: array of vehicleIds
- Returns: array of created favorite objects
- Authentication: Required (JWT)

**DELETE /api/favorites/bulk**
- Remove multiple vehicles from favorites
- Request body: array of vehicleIds
- Returns: 204 No Content
- Authentication: Required (JWT)

### Request Schemas

**AddFavoriteRequest**
```
{
  "vehicleId": "string (required, UUID)",
  "notes": "string (optional, max 500 characters)",
  "alertPreferences": {
    "priceChangeEnabled": "boolean (default: true)",
    "priceChangeThreshold": "decimal (optional, percentage)",
    "availabilityAlertEnabled": "boolean (default: true)",
    "notificationChannels": "array of strings (email, push)"
  }
}
```

**CheckAvailabilityRequest**
```
{
  "pickupDate": "ISO 8601 datetime (required)",
  "returnDate": "ISO 8601 datetime (required)",
  "pickupLocationId": "string (required, UUID)",
  "returnLocationId": "string (optional, UUID)"
}
```

**UpdateAlertPreferencesRequest**
```
{
  "priceChangeEnabled": "boolean (optional)",
  "priceChangeThreshold": "decimal (optional)",
  "availabilityAlertEnabled": "boolean (optional)",
  "notificationChannels": "array of strings (optional)"
}
```

**ShareFavoritesRequest**
```
{
  "expirationDays": "integer (optional, default: 30)",
  "isPublic": "boolean (optional, default: true)",
  "password": "string (optional, for private shares)",
  "recipientEmail": "string (optional)"
}
```

**BulkFavoriteRequest**
```
{
  "vehicleIds": "array of strings (required, UUIDs)"
}
```

### Response Schemas

**FavoriteResponse**
```
{
  "id": "string (UUID)",
  "userId": "string (UUID)",
  "vehicleId": "string (UUID)",
  "vehicle": {
    "id": "string (UUID)",
    "name": "string",
    "category": "string",
    "imageUrl": "string",
    "currentPrice": "decimal",
    "rating": "decimal",
    "availabilityStatus": "string"
  },
  "notes": "string",
  "alertPreferences": {
    "priceChangeEnabled": "boolean",
    "priceChangeThreshold": "decimal",
    "availabilityAlertEnabled": "boolean",
    "notificationChannels": "array of strings"
  },
  "priceHistory": {
    "currentPrice": "decimal",
    "previousPrice": "decimal",
    "priceChangePercentage": "decimal",
    "lastChecked": "ISO 8601 datetime"
  },
  "metadata": {
    "addedAt": "ISO 8601 datetime",
    "lastViewed": "ISO 8601 datetime",
    "viewCount": "integer"
  }
}
```

**AvailabilityResponse**
```
{
  "vehicleId": "string (UUID)",
  "isAvailable": "boolean",
  "availabilityStatus": "string (available, limited, unavailable)",
  "pricing": {
    "dailyRate": "decimal",
    "totalCost": "decimal",
    "currency": "string"
  },
  "restrictions": "array of strings",
  "alternativeDates": "array of date ranges (if unavailable)"
}
```

**AlertHistoryResponse**
```
{
  "alerts": [
    {
      "id": "string (UUID)",
      "vehicleId": "string (UUID)",
      "vehicleName": "string",
      "alertType": "string (price_change, availability)",
      "sentAt": "ISO 8601 datetime",
      "opened": "boolean",
      "clicked": "boolean",
      "alertData": "object"
    }
  ],
  "pagination": {
    "page": "integer",
    "pageSize": "integer",
    "totalCount": "integer"
  }
}
```

**ShareLinkResponse**
```
{
  "shareUrl": "string (full URL)",
  "token": "string",
  "expiresAt": "ISO 8601 datetime",
  "isPublic": "boolean",
  "createdAt": "ISO 8601 datetime"
}
```

### Business Logic

**Favorite Validation**
- Verify vehicle exists and is active
- Prevent duplicate favorites (same user + vehicle)
- Enforce maximum of 100 favorites per user
- Validate alert preferences are within allowed ranges

**Price Monitoring**
- Background job runs hourly to check prices for favorited vehicles
- Compare current price with last recorded price
- Calculate percentage change
- Trigger alert if change exceeds user threshold (default 5%)
- Update price history in database

**Availability Monitoring**
- Check availability when user specifies preferred dates
- Monitor availability changes for vehicles with date preferences
- Trigger alert when previously unavailable vehicle becomes available
- Respect user's preferred locations and date ranges

**Alert Processing**
- Generate notifications based on user preferences
- Respect notification frequency limits (max 3 per day per user)
- Honor quiet hours (no notifications 10 PM - 8 AM local time)
- Track alert delivery and user interactions
- Implement exponential backoff for repeated alerts

**Share Link Management**
- Generate unique, secure tokens for shared favorites
- Set expiration based on user preference (default 30 days)
- Support password protection for private shares
- Track share link usage and analytics
- Automatically clean up expired shares

### Authentication Requirements

**Required for All Endpoints**: JWT token in Authorization header (except public share links)
**Ownership Validation**: User can only access their own favorites
**Share Link Access**: Public or password-protected access with valid token
**Rate Limiting**: 200 requests per hour per user for favorite operations
**Permissions**: Standard user role sufficient, no elevated privileges required

## Database Specifications

### Schema Changes

**New Table: favorite_vehicles**
- Primary table for storing user favorite vehicles
- Includes alert preferences and metadata

**New Table: favorite_vehicle_alerts**
- Stores alert history for favorited vehicles
- Tracks price changes and availability notifications

**New Table: favorite_vehicle_shares**
- Manages shared favorites lists
- Tracks share link usage and expiration

**New Table: favorite_price_history**
- Tracks price changes over time for favorited vehicles
- Enables price trend analysis and charting

### Table Definitions

**favorite_vehicles**
```
id                      VARCHAR(36) PRIMARY KEY (UUID)
user_id                 VARCHAR(36) NOT NULL (FK to users.id)
vehicle_id              VARCHAR(36) NOT NULL (FK to vehicles.id)
notes                   TEXT NULL
alert_preferences       JSON NOT NULL
added_at                DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
last_viewed_at          DATETIME NULL
view_count              INT DEFAULT 0
preferred_pickup_date   DATETIME NULL
preferred_return_date   DATETIME NULL
preferred_location_id   VARCHAR(36) NULL (FK to locations.id)

UNIQUE KEY uk_user_vehicle (user_id, vehicle_id)
INDEX idx_user_id (user_id)
INDEX idx_vehicle_id (vehicle_id)
INDEX idx_added_at (added_at)
```

**favorite_vehicle_alerts**
```
id                  VARCHAR(36) PRIMARY KEY (UUID)
favorite_id         VARCHAR(36) NOT NULL (FK to favorite_vehicles.id)
alert_type          ENUM('price_change', 'availability', 'price_drop') NOT NULL
notification_channel ENUM('email', 'push') NOT NULL
sent_at             DATETIME NOT NULL
opened_at           DATETIME NULL
clicked_at          DATETIME NULL
alert_data          JSON NOT NULL
status              ENUM('sent', 'delivered', 'failed') NOT NULL

INDEX idx_favorite_id (favorite_id)
INDEX idx_sent_at (sent_at)
INDEX idx_alert_type (alert_type)
```

**favorite_vehicle_shares**
```
id                  VARCHAR(36) PRIMARY KEY (UUID)
user_id             VARCHAR(36) NOT NULL (FK to users.id)
share_token         VARCHAR(64) UNIQUE NOT NULL
is_public           BOOLEAN DEFAULT TRUE
password_hash       VARCHAR(255) NULL
created_at          DATETIME NOT NULL
expires_at          DATETIME NOT NULL
access_count        INT DEFAULT 0
last_accessed_at    DATETIME NULL

INDEX idx_share_token (share_token)
INDEX idx_user_id (user_id)
INDEX idx_expires_at (expires_at)
```

**favorite_price_history**
```
id                  VARCHAR(36) PRIMARY KEY (UUID)
favorite_id         VARCHAR(36) NOT NULL (FK to favorite_vehicles.id)
price               DECIMAL(10,2) NOT NULL
checked_at          DATETIME NOT NULL
price_change        DECIMAL(10,2) NULL
price_change_pct    DECIMAL(5,2) NULL

INDEX idx_favorite_id (favorite_id)
INDEX idx_checked_at (checked_at)
```

### Relationships

**favorite_vehicles → users**
- Many-to-one relationship
- Foreign key: user_id references users.id
- Cascade delete: When user is deleted, all favorites are deleted

**favorite_vehicles → vehicles**
- Many-to-one relationship
- Foreign key: vehicle_id references vehicles.id
- Cascade delete: When vehicle is deleted, all favorites are deleted

**favorite_vehicles → locations**
- Many-to-one relationship (optional)
- Foreign key: preferred_location_id references locations.id
- Set null: When location is deleted, set to null

**favorite_vehicle_alerts → favorite_vehicles**
- Many-to-one relationship
- Foreign key: favorite_id references favorite_vehicles.id
- Cascade delete: When favorite is deleted, all alerts are deleted

**favorite_vehicle_shares → users**
- Many-to-one relationship
- Foreign key: user_id references users.id
- Cascade delete: When user is deleted, all shares are deleted

**favorite_price_history → favorite_vehicles**
- Many-to-one relationship
- Foreign key: favorite_id references favorite_vehicles.id
- Cascade delete: When favorite is deleted, price history is deleted

### Indexes

**Performance Optimization Indexes**
- `uk_user_vehicle` on favorite_vehicles: Prevent duplicate favorites
- `idx_user_id` on favorite_vehicles: Fast retrieval of user's favorites
- `idx_vehicle_id` on favorite_vehicles: Find all users who favorited a vehicle
- `idx_added_at` on favorite_vehicles: Sorting by date added
- `idx_favorite_id` on favorite_vehicle_alerts: Alert history lookup
- `idx_sent_at` on favorite_vehicle_alerts: Alert analytics
- `idx_share_token` on favorite_vehicle_shares: Fast share link resolution
- `idx_expires_at` on favorite_vehicle_shares: Cleanup of expired shares
- `idx_favorite_id` on favorite_price_history: Price trend queries
- `idx_checked_at` on favorite_price_history: Time-series analysis

## Technology Stack

- **Backend**: .NET 8+ with C#, ASP.NET Core Web API, Entity Framework Core
- **Database**: MySQL 8.0+ with InnoDB storage engine
- **Frontend**: Next.js 14+ with React 18+, TypeScript, Tailwind CSS
- **Background Jobs**: Hangfire for price monitoring
- **Notifications**: SendGrid (email), Firebase Cloud Messaging (push)
- **Caching**: Redis for favorite status lookups

## Implementation Notes

### Price Monitoring Strategy
Implement hourly background job to check prices for all favorited vehicles. Use batch processing to minimize API calls. Cache price data to reduce database queries. Consider implementing priority queue where frequently viewed favorites are checked more often.

### Notification Throttling
Limit notifications to prevent alert fatigue. Maximum 3 alerts per day per user. Provide daily digest option for users who want consolidated updates. Implement smart alerting that learns user preferences over time.

### Performance Optimization
Cache favorite status for quick lookups during search results rendering. Implement lazy loading for favorite vehicle details. Use pagination for users with many favorites. Consider implementing virtual scrolling for large lists.

### Mobile Optimization
Ensure favorites dashboard is fully responsive. Implement swipe gestures for quick remove action. Support pull-to-refresh for updating prices and availability. Optimize images for mobile bandwidth.

### Analytics and Insights
Track which vehicles are most frequently favorited to inform inventory decisions. Monitor alert effectiveness (open rates, click-through rates). Identify popular vehicle types and features among favorited vehicles.

### Future Enhancements
- Price prediction using machine learning
- Smart availability alerts based on booking patterns
- Collaborative favorites for group travel
- Integration with calendar for automatic availability checks
- Comparison tool for favorited vehicles
- Price history charts and trend analysis
