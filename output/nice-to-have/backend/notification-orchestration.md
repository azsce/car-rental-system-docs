# Feature: Notification Orchestration

## Overview

Notification Orchestration coordinates notifications across multiple channels (email, SMS, push, in-app) based on message urgency, user preferences, and delivery success. This intelligent routing system ensures critical messages reach users through the most appropriate channels while respecting user preferences and preventing notification fatigue.

## Sprint Category

nice-to-have

## Feature IDs

F-INT-NOTIF-005

## User Stories

As a platform, I want to automatically select the best notification channels based on message urgency, so that critical messages are delivered reliably.

As a user, I want the system to respect my channel preferences, so that I receive notifications through my preferred methods.

As a platform, I want to implement fallback channels when primary delivery fails, so that important messages still reach users.

As a marketing manager, I want to coordinate multi-channel campaigns, so that users receive consistent messaging across email, push, and SMS.

As a platform administrator, I want to prevent notification spam, so that users don't become overwhelmed and disengage.

## Frontend Specifications

### Pages

**Notification Preferences Page**
- Channel preferences section (email, SMS, push, in-app)
- Notification type preferences with channel selection
- Quiet hours configuration
- Frequency controls (immediate, daily digest, weekly)
- Notification preview/test functionality

### UI Components

**Channel Preference Toggles**
- Email notifications toggle
- SMS notifications toggle
- Push notifications toggle
- In-app notifications toggle
- Per-channel status indicators

**Notification Type Matrix**
- Grid showing notification types vs channels
- Checkboxes for each type-channel combination
- Recommended settings indicator
- Bulk enable/disable options

**Quiet Hours Configurator**
- Time range picker (start and end time)
- Timezone selector
- Days of week selector
- Enable/disable toggle
- Exception rules (allow critical notifications)

**Frequency Controls**
- Immediate delivery option
- Daily digest option (with time selection)
- Weekly digest option (with day and time selection)
- Per-notification-type frequency settings

### User Flows

**Setting Channel Preferences**
1. User navigates to notification settings
2. User toggles channels on/off
3. User selects notification types per channel
4. User saves preferences
5. System validates and confirms changes

**Configuring Quiet Hours**
1. User enables quiet hours
2. User sets start and end times
3. User selects timezone
4. User chooses exception rules
5. System applies quiet hours to future notifications

### Data Requirements

- User channel preferences
- Notification type to channel mappings
- Quiet hours configuration
- Delivery success rates by channel
- User engagement metrics

## Backend Specifications

### API Endpoints

**POST /api/notifications/orchestrate**
- Purpose: Orchestrate notification delivery across channels
- Authentication: Internal service authentication
- Request body: User ID, notification content, priority, type
- Response: Orchestration job ID, selected channels

**GET /api/notifications/orchestration/{jobId}/status**
- Purpose: Check orchestration job status
- Authentication: Internal service authentication
- Response: Delivery status per channel, fallback attempts

**PUT /api/notifications/preferences/channels**
- Purpose: Update user channel preferences
- Authentication: JWT token
- Request body: Channel preferences, notification type mappings
- Response: Updated preferences

**GET /api/notifications/preferences/channels**
- Purpose: Get user channel preferences
- Authentication: JWT token
- Response: Current channel preferences and mappings

**POST /api/notifications/orchestration/rules**
- Purpose: Create orchestration rule (admin)
- Authentication: JWT token (admin role)
- Request body: Rule definition, conditions, channel selection logic
- Response: Created rule ID

**GET /api/notifications/orchestration/rules**
- Purpose: List orchestration rules (admin)
- Authentication: JWT token (admin role)
- Response: List of active orchestration rules

### Request Schemas

**Orchestrate Notification Request**
```
{
  "userId": "user_123",
  "notification": {
    "type": "booking_confirmation",
    "priority": "high",
    "title": "Booking Confirmed",
    "body": "Your Toyota Camry is reserved for Mar 1, 10:00 AM",
    "data": {
      "bookingId": "BK-12345",
      "vehicleName": "Toyota Camry",
      "pickupDate": "2026-03-01T10:00:00Z"
    }
  },
  "channels": {
    "preferred": ["email", "push"],
    "fallback": ["sms"],
    "exclude": []
  },
  "scheduledAt": null,
  "expiresAt": "2026-03-01T12:00:00Z"
}
```

**Update Channel Preferences Request**
```
{
  "channels": {
    "email": {
      "enabled": true,
      "types": ["booking_confirmation", "payment_receipt", "trip_reminder", "platform_update"]
    },
    "sms": {
      "enabled": true,
      "types": ["booking_confirmation", "trip_reminder", "2fa"]
    },
    "push": {
      "enabled": true,
      "types": ["booking_confirmation", "trip_reminder", "promotion", "trip_update"]
    },
    "inApp": {
      "enabled": true,
      "types": ["all"]
    }
  },
  "quietHours": {
    "enabled": true,
    "startTime": "22:00",
    "endTime": "08:00",
    "timezone": "America/New_York",
    "allowCritical": true
  },
  "frequency": {
    "immediate": ["booking_confirmation", "trip_reminder", "2fa"],
    "dailyDigest": ["promotion", "platform_update"],
    "weeklyDigest": []
  }
}
```

**Orchestration Rule Request**
```
{
  "ruleName": "Critical Booking Notifications",
  "priority": 1,
  "conditions": {
    "notificationType": ["booking_confirmation", "booking_cancellation"],
    "priority": ["high", "critical"]
  },
  "channelSelection": {
    "primary": ["email", "push"],
    "fallback": ["sms"],
    "fallbackDelay": 300
  },
  "isActive": true
}
```

### Response Schemas

**Orchestration Response**
```
{
  "jobId": "orch_abc123",
  "userId": "user_123",
  "selectedChannels": ["email", "push"],
  "fallbackChannels": ["sms"],
  "status": "queued",
  "queuedAt": "2026-02-24T14:30:00Z",
  "estimatedDelivery": {
    "email": "2026-02-24T14:30:05Z",
    "push": "2026-02-24T14:30:03Z"
  }
}
```

**Orchestration Status Response**
```
{
  "jobId": "orch_abc123",
  "status": "completed",
  "deliveryResults": {
    "email": {
      "status": "delivered",
      "deliveredAt": "2026-02-24T14:30:05Z",
      "messageId": "em_xyz789"
    },
    "push": {
      "status": "delivered",
      "deliveredAt": "2026-02-24T14:30:03Z",
      "messageId": "push_xyz789"
    },
    "sms": {
      "status": "not_attempted",
      "reason": "primary_channels_succeeded"
    }
  },
  "completedAt": "2026-02-24T14:30:05Z"
}
```

**Channel Preferences Response**
```
{
  "userId": "user_123",
  "channels": {
    "email": {
      "enabled": true,
      "verified": true,
      "types": ["booking_confirmation", "payment_receipt"]
    },
    "sms": {
      "enabled": true,
      "verified": true,
      "types": ["booking_confirmation", "trip_reminder"]
    },
    "push": {
      "enabled": true,
      "deviceCount": 2,
      "types": ["booking_confirmation", "trip_reminder", "promotion"]
    },
    "inApp": {
      "enabled": true,
      "types": ["all"]
    }
  },
  "quietHours": {
    "enabled": true,
    "startTime": "22:00",
    "endTime": "08:00",
    "timezone": "America/New_York",
    "allowCritical": true
  }
}
```

### Business Logic

**Channel Selection Logic**
- **Critical/Urgent**: SMS + Push + Email (all channels)
- **Important**: Push + Email (primary channels)
- **Informational**: Email only (low-cost channel)
- **Marketing**: Email + Push (with opt-in verification)
- **Transactional**: Email + Push (reliable channels)

**Priority-Based Routing**
- Evaluate notification priority level
- Map priority to channel combination
- Apply user channel preferences as filter
- Select channels that are both enabled and appropriate
- Queue notifications for selected channels

**Fallback Strategy**
- Define primary and fallback channels per notification type
- Monitor primary channel delivery status
- Trigger fallback after configurable delay (e.g., 5 minutes)
- Attempt fallback channels in order
- Stop when successful delivery confirmed

**Quiet Hours Enforcement**
- Check user's quiet hours configuration
- Compare notification time with quiet hours window
- Defer non-critical notifications until quiet hours end
- Allow critical notifications to bypass quiet hours
- Adjust for user's timezone

**Frequency Control**
- Track notification frequency per user per type
- Implement rate limiting (e.g., max 5 marketing messages per day)
- Batch non-urgent notifications into digests
- Send digests at user-preferred times
- Prevent notification fatigue

**User Preference Application**
- Load user channel preferences
- Filter channels based on enabled status
- Check notification type against allowed types per channel
- Respect opt-out preferences
- Apply frequency controls

**Delivery Tracking**
- Track delivery attempts per channel
- Monitor delivery success/failure
- Calculate delivery rates by channel
- Identify problematic channels
- Optimize channel selection based on historical performance

**Template Selection**
- Select appropriate template per channel
- Adapt content for channel constraints (SMS character limits)
- Personalize content with user data
- Support multi-language templates
- Version templates for A/B testing

### Authentication Requirements

- Internal service authentication for orchestration
- JWT token authentication for preference management
- Admin role required for rule management
- User can only modify their own preferences

## Database Specifications

### Schema Changes

Create new tables for orchestration jobs, rules, and channel preferences.

### Table Definitions

**NotificationOrchestrationJobs**
- JobId (VARCHAR(50), PRIMARY KEY): Unique job identifier
- UserId (VARCHAR(50), FOREIGN KEY): Target user
- NotificationType (VARCHAR(100), NOT NULL): Notification type
- Priority (ENUM: low, normal, high, critical): Notification priority
- Status (ENUM: queued, processing, completed, failed): Job status
- SelectedChannels (JSON, NOT NULL): Array of selected channels
- FallbackChannels (JSON, NOT NULL): Array of fallback channels
- DeliveryResults (JSON, NULL): Delivery status per channel
- QueuedAt (DATETIME, NOT NULL): Job creation time
- ProcessedAt (DATETIME, NULL): Processing start time
- CompletedAt (DATETIME, NULL): Completion time
- CreatedAt (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- UpdatedAt (DATETIME, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

**NotificationOrchestrationRules**
- RuleId (INT, AUTO_INCREMENT, PRIMARY KEY)
- RuleName (VARCHAR(255), NOT NULL): Human-readable rule name
- Priority (INT, DEFAULT 100): Rule priority (lower = higher priority)
- Conditions (JSON, NOT NULL): Rule matching conditions
- ChannelSelection (JSON, NOT NULL): Channel selection logic
- IsActive (BOOLEAN, DEFAULT TRUE): Active status
- CreatedBy (VARCHAR(50), FOREIGN KEY): Admin who created rule
- CreatedAt (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- UpdatedAt (DATETIME, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

**UserChannelPreferences**
- PreferenceId (INT, AUTO_INCREMENT, PRIMARY KEY)
- UserId (VARCHAR(50), UNIQUE, FOREIGN KEY): User
- EmailEnabled (BOOLEAN, DEFAULT TRUE): Email channel enabled
- EmailTypes (JSON, NOT NULL): Allowed email notification types
- SmsEnabled (BOOLEAN, DEFAULT TRUE): SMS channel enabled
- SmsTypes (JSON, NOT NULL): Allowed SMS notification types
- PushEnabled (BOOLEAN, DEFAULT TRUE): Push channel enabled
- PushTypes (JSON, NOT NULL): Allowed push notification types
- InAppEnabled (BOOLEAN, DEFAULT TRUE): In-app channel enabled
- InAppTypes (JSON, NOT NULL): Allowed in-app notification types
- QuietHoursEnabled (BOOLEAN, DEFAULT FALSE): Quiet hours active
- QuietHoursStart (TIME, NULL): Quiet hours start time
- QuietHoursEnd (TIME, NULL): Quiet hours end time
- QuietHoursTimezone (VARCHAR(50), DEFAULT 'UTC'): User timezone
- AllowCriticalDuringQuiet (BOOLEAN, DEFAULT TRUE): Allow critical notifications
- FrequencySettings (JSON, NULL): Frequency control settings
- CreatedAt (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- UpdatedAt (DATETIME, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

**NotificationFrequencyTracking**
- TrackingId (INT, AUTO_INCREMENT, PRIMARY KEY)
- UserId (VARCHAR(50), FOREIGN KEY): User
- NotificationType (VARCHAR(100), NOT NULL): Notification type
- Channel (ENUM: email, sms, push, inApp): Delivery channel
- SentAt (DATETIME, NOT NULL): Send timestamp
- Date (DATE, NOT NULL): Send date for daily aggregation
- CreatedAt (DATETIME, DEFAULT CURRENT_TIMESTAMP)

### Relationships

- NotificationOrchestrationJobs.UserId → Users.UserId (many-to-one)
- NotificationOrchestrationRules.CreatedBy → Users.UserId (many-to-one)
- UserChannelPreferences.UserId → Users.UserId (one-to-one)
- NotificationFrequencyTracking.UserId → Users.UserId (many-to-one)

### Indexes

- NotificationOrchestrationJobs: Index on (Status, QueuedAt) for job processing
- NotificationOrchestrationJobs: Index on (UserId, CreatedAt) for user history
- NotificationOrchestrationRules: Index on (IsActive, Priority) for rule matching
- UserChannelPreferences: Unique index on (UserId) for preference lookup
- NotificationFrequencyTracking: Index on (UserId, Date, NotificationType) for frequency checks

## Technology Stack

- Backend: .NET 8+ with C#, ASP.NET Core Web API
- Database: MySQL 8.0+
- Message Queue: RabbitMQ or Azure Service Bus for orchestration jobs
- Rules Engine: Custom or third-party rules engine for complex routing
- Caching: Redis for preference caching

## Implementation Notes

**Orchestration Workflow**
1. Receive notification request with user ID and content
2. Load user channel preferences from cache/database
3. Evaluate orchestration rules to determine channels
4. Apply user preferences to filter channels
5. Check quiet hours and frequency limits
6. Queue notifications for selected channels
7. Monitor delivery status
8. Trigger fallback channels if needed
9. Update orchestration job status

**Rule Engine Design**
- Define rules with conditions and actions
- Support complex conditions (AND, OR, NOT logic)
- Priority-based rule evaluation
- Cache compiled rules for performance
- Support rule versioning and A/B testing

**Performance Optimization**
- Cache user preferences in Redis
- Batch orchestration jobs for efficiency
- Use message queue for async processing
- Implement connection pooling
- Monitor queue depth and processing lag

**Fallback Logic**
- Define fallback delay per notification type
- Monitor primary channel delivery status
- Trigger fallback only if primary fails or times out
- Track fallback success rates
- Optimize fallback strategy based on data

**Quiet Hours Implementation**
- Store quiet hours in user's local timezone
- Convert notification time to user's timezone
- Check if current time falls within quiet hours
- Queue deferred notifications for later delivery
- Send queued notifications when quiet hours end

**Frequency Limiting**
- Track notification count per user per day
- Implement sliding window rate limiting
- Batch non-urgent notifications into digests
- Send digests at optimal times (e.g., 9 AM)
- Provide frequency override for critical notifications

**Testing Strategy**
- Test channel selection logic with various scenarios
- Test fallback behavior with simulated failures
- Test quiet hours across timezones
- Test frequency limiting with high-volume scenarios
- Test preference changes and immediate application

**Monitoring and Analytics**
- Track orchestration job success rate
- Monitor channel selection distribution
- Track fallback trigger rate
- Monitor quiet hours deferral rate
- Dashboard for orchestration performance
- Alert on high failure rates

**Best Practices**
- Start with conservative frequency limits
- Provide clear preference UI with recommendations
- Respect user preferences strictly
- Monitor and optimize based on engagement data
- A/B test channel combinations
- Provide transparency about channel selection

## Source Documentation

- docs/05-features/integration/notification-services.md
