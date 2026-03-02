# Feature: In-App Notification Center

## Overview

The In-App Notification Center provides a persistent notification inbox within mobile and web applications where users can view, manage, and interact with their notification history. This feature ensures users never miss important messages and can access rich notification content with images, links, and actionable buttons even after the initial notification has been dismissed.

## Sprint Category

nice-to-have

## Feature IDs

F-INT-NOTIF-004

## User Stories

As a user, I want to view all my past notifications in one place, so that I can review messages I may have missed or dismissed.

As a user, I want to mark notifications as read or unread, so that I can keep track of which messages I've reviewed.

As a user, I want to delete notifications I no longer need, so that I can keep my notification center organized.

As a user, I want to filter notifications by category, so that I can quickly find specific types of messages.

As a user, I want to see a badge count of unread notifications, so that I know when I have new messages without opening the app.

As a support agent, I want customers to have access to their notification history, so that they can reference past communications during support inquiries.

## Frontend Specifications

### Pages

**Notification Center Page**
- Header with "Notifications" title and unread count
- Filter tabs (All, Bookings, Payments, Promotions, Updates)
- List of notifications sorted by date (newest first)
- Empty state when no notifications
- Pull-to-refresh functionality
- Infinite scroll for pagination
- Mark all as read button

**Notification Detail Modal**
- Full notification content
- Rich media (images, videos)
- Action buttons
- Timestamp
- Mark as read/unread toggle
- Delete button
- Share button (if applicable)

### UI Components

**Notification List Item**
- Notification icon (category-specific)
- Title (bold if unread)
- Message preview (2 lines max)
- Timestamp (relative: "2 hours ago")
- Unread indicator (blue dot)
- Swipe actions (mark read, delete)
- Tap to expand/view details

**Notification Badge**
- Unread count on app icon (mobile)
- Unread count on notification tab
- Red badge with white text
- Auto-update on new notifications
- Clear when all read

**Category Filter Tabs**
- All notifications
- Bookings (booking updates, confirmations)
- Payments (receipts, payment reminders)
- Promotions (offers, deals)
- Updates (platform updates, announcements)
- Active tab highlighted

**Empty State**
- Illustration or icon
- "No notifications yet" message
- Helpful text explaining notification types
- Call-to-action (e.g., "Browse vehicles")

**Notification Actions**
- Primary action button (e.g., "View Booking")
- Secondary action button (e.g., "Get Directions")
- Dismiss button
- Deep link to relevant app screen

### User Flows

**Viewing Notifications**
1. User taps notification center icon/tab
2. App displays list of notifications
3. Unread notifications shown with indicator
4. User scrolls through list
5. User taps notification to view details
6. Notification marked as read automatically

**Managing Notifications**
1. User swipes left on notification
2. Delete and Mark Read options appear
3. User selects action
4. Notification updated or removed
5. Badge count updated

**Filtering Notifications**
1. User taps category filter tab
2. List filters to show only that category
3. Unread count updates for filtered view
4. User can switch between categories

**Taking Action**
1. User taps notification
2. Detail view opens
3. User taps action button
4. App navigates to relevant screen
5. Notification remains in history

### Data Requirements

- Notification ID and metadata
- Notification content (title, body, image)
- Category/type classification
- Read/unread status
- Timestamp
- Deep link URLs
- Action button configurations
- User ID for filtering

## Backend Specifications

### API Endpoints

**GET /api/notifications/inbox**
- Purpose: Retrieve user's notification history
- Authentication: JWT token
- Query parameters: category, status (read/unread), limit, offset, since
- Response: Paginated list of notifications

**GET /api/notifications/inbox/unread-count**
- Purpose: Get count of unread notifications
- Authentication: JWT token
- Query parameters: category (optional)
- Response: Unread count by category

**PUT /api/notifications/inbox/{notificationId}/read**
- Purpose: Mark notification as read
- Authentication: JWT token
- Response: Updated notification status

**PUT /api/notifications/inbox/mark-all-read**
- Purpose: Mark all notifications as read
- Authentication: JWT token
- Query parameters: category (optional)
- Response: Count of notifications marked as read

**DELETE /api/notifications/inbox/{notificationId}**
- Purpose: Delete notification from inbox
- Authentication: JWT token
- Response: Deletion confirmation

**POST /api/notifications/inbox/sync**
- Purpose: Sync notifications across devices
- Authentication: JWT token
- Request body: Last sync timestamp, device ID
- Response: New notifications since last sync

### Request Schemas

**Get Inbox Request (Query Parameters)**
```
category: "bookings" | "payments" | "promotions" | "updates" | null
status: "read" | "unread" | null
limit: 20
offset: 0
since: "2026-02-20T00:00:00Z"
```

**Mark as Read Request**
```
{
  "notificationId": "notif_abc123"
}
```

**Sync Request**
```
{
  "lastSyncAt": "2026-02-24T14:00:00Z",
  "deviceId": "dev_xyz789"
}
```

### Response Schemas

**Inbox Response**
```
{
  "notifications": [
    {
      "notificationId": "notif_abc123",
      "category": "bookings",
      "title": "Booking Confirmed",
      "body": "Your Toyota Camry is reserved for Mar 1, 10:00 AM",
      "imageUrl": "https://cdn.example.com/vehicles/camry.jpg",
      "deepLink": "app://bookings/BK-12345",
      "actions": [
        {
          "id": "view",
          "title": "View Booking",
          "deepLink": "app://bookings/BK-12345"
        }
      ],
      "isRead": false,
      "createdAt": "2026-02-24T14:30:00Z",
      "readAt": null
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  },
  "unreadCount": 5
}
```

**Unread Count Response**
```
{
  "total": 5,
  "byCategory": {
    "bookings": 2,
    "payments": 1,
    "promotions": 2,
    "updates": 0
  }
}
```

### Business Logic

**Notification Storage**
- Store all notifications sent to user in database
- Persist notification content, metadata, and status
- Support rich content (images, actions, deep links)
- Maintain notification history for configurable period (e.g., 90 days)
- Auto-archive old notifications

**Read Status Management**
- Track read/unread status per notification
- Update status when user views notification
- Support mark as read/unread actions
- Calculate unread counts efficiently
- Sync read status across user's devices

**Category Classification**
- Automatically categorize notifications by type
- Support filtering by category
- Maintain category-specific unread counts
- Allow users to customize category preferences

**Cross-Device Sync**
- Sync notification status across devices
- Use last sync timestamp for incremental updates
- Handle conflicts (e.g., read on one device, unread on another)
- Push sync updates via WebSocket or polling

**Notification Lifecycle**
- Store notifications when sent
- Update status based on user actions
- Archive notifications after retention period
- Provide export functionality for user data requests

**Performance Optimization**
- Cache unread counts for fast retrieval
- Use pagination for large notification lists
- Index notifications by user and timestamp
- Implement efficient filtering queries

### Authentication Requirements

- JWT token authentication for all endpoints
- User can only access their own notifications
- Admin role can view all notifications for support purposes
- Device ID validation for sync operations

## Database Specifications

### Schema Changes

Create new table for in-app notification storage and extend existing notification tables.

### Table Definitions

**InAppNotifications**
- NotificationId (VARCHAR(50), PRIMARY KEY): Unique notification identifier
- UserId (VARCHAR(50), FOREIGN KEY, NOT NULL): Notification recipient
- Category (ENUM: bookings, payments, promotions, updates, general): Notification category
- Title (VARCHAR(255), NOT NULL): Notification title
- Body (TEXT, NOT NULL): Notification message
- ImageUrl (VARCHAR(500), NULL): Notification image URL
- DeepLink (VARCHAR(500), NULL): App deep link URL
- IsRead (BOOLEAN, DEFAULT FALSE): Read status
- ReadAt (DATETIME, NULL): Read timestamp
- IsDeleted (BOOLEAN, DEFAULT FALSE): Soft delete flag
- DeletedAt (DATETIME, NULL): Deletion timestamp
- ExpiresAt (DATETIME, NULL): Notification expiration
- CreatedAt (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- UpdatedAt (DATETIME, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

**InAppNotificationActions**
- ActionId (INT, AUTO_INCREMENT, PRIMARY KEY)
- NotificationId (VARCHAR(50), FOREIGN KEY): Reference to InAppNotifications
- ActionIdentifier (VARCHAR(100), NOT NULL): Action button ID
- ActionTitle (VARCHAR(255), NOT NULL): Action button text
- DeepLink (VARCHAR(500), NULL): Action deep link
- IsPrimary (BOOLEAN, DEFAULT FALSE): Primary action flag
- CreatedAt (DATETIME, DEFAULT CURRENT_TIMESTAMP)

**NotificationSyncLog**
- SyncId (INT, AUTO_INCREMENT, PRIMARY KEY)
- UserId (VARCHAR(50), FOREIGN KEY): User performing sync
- DeviceId (VARCHAR(50), NOT NULL): Device identifier
- LastSyncAt (DATETIME, NOT NULL): Last sync timestamp
- NotificationsSynced (INT, DEFAULT 0): Count of synced notifications
- CreatedAt (DATETIME, DEFAULT CURRENT_TIMESTAMP)

### Relationships

- InAppNotifications.UserId → Users.UserId (many-to-one)
- InAppNotificationActions.NotificationId → InAppNotifications.NotificationId (many-to-one)
- NotificationSyncLog.UserId → Users.UserId (many-to-one)

### Indexes

- InAppNotifications: Index on (UserId, IsDeleted, CreatedAt DESC) for inbox queries
- InAppNotifications: Index on (UserId, IsRead, IsDeleted) for unread count
- InAppNotifications: Index on (UserId, Category, IsDeleted, CreatedAt DESC) for category filtering
- InAppNotifications: Index on (ExpiresAt) for cleanup jobs
- InAppNotificationActions: Index on (NotificationId) for action lookup
- NotificationSyncLog: Index on (UserId, DeviceId, LastSyncAt) for sync queries

## Technology Stack

- Backend: .NET 8+ with C#, ASP.NET Core Web API
- Database: MySQL 8.0+
- Frontend: Next.js 14+ with TypeScript (web), React Native (mobile)
- Real-time: SignalR or WebSocket for live updates
- Caching: Redis for unread count caching

## Implementation Notes

**UI/UX Best Practices**
- Show most recent notifications first
- Use relative timestamps (e.g., "2 hours ago")
- Provide visual distinction between read and unread
- Support swipe gestures for quick actions
- Implement pull-to-refresh for manual updates
- Use skeleton screens while loading
- Provide empty state with helpful messaging

**Performance Optimization**
- Implement virtual scrolling for large lists
- Cache unread counts in Redis
- Use pagination to limit data transfer
- Prefetch next page while user scrolls
- Optimize database queries with proper indexes
- Use CDN for notification images

**Real-Time Updates**
- Use WebSocket or SignalR for live notification delivery
- Push new notifications to open notification center
- Update unread counts in real-time
- Sync read status across devices instantly
- Handle connection drops gracefully

**Data Retention**
- Archive notifications after 90 days
- Provide export functionality before deletion
- Allow users to manually delete notifications
- Implement soft delete for recovery
- Comply with data retention regulations

**Accessibility**
- Support screen readers for notification content
- Provide keyboard navigation
- Use semantic HTML for notification structure
- Ensure sufficient color contrast
- Support dynamic text sizing

**Testing Strategy**
- Test with large notification lists (1000+ items)
- Test cross-device sync scenarios
- Test offline behavior and sync on reconnect
- Test notification actions and deep linking
- Test filtering and search functionality

**Monitoring**
- Track notification center open rate
- Monitor notification interaction rate
- Track time to read notifications
- Monitor sync performance
- Alert on sync failures

## Source Documentation

- docs/05-features/integration/notification-services.md
