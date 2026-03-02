# Feature: Notification Preferences

## Overview

Notification Preferences provides users with granular control over communication preferences across multiple channels (email, push notifications, SMS). Users can customize which types of notifications they receive, set quiet hours to avoid disturbances, control notification frequency for promotional content, and select their preferred language for communications. This feature ensures users receive relevant information without being overwhelmed, building trust through respect for user preferences.

## Sprint Category

nice-to-have (Nice-to-have - Would be great but not essential)

## Feature ID

F-AM-007

## User Stories

**As a registered user**, I want to control which notifications I receive and through which channels, so that I only get communications that are relevant to me without being overwhelmed.

**As a busy professional**, I want to set quiet hours for notifications, so that I'm not disturbed during meetings or sleep hours.

**As a frequent renter**, I want to receive trip reminders and booking confirmations but opt out of promotional emails, so that I stay informed about my bookings without marketing noise.

**As an international user**, I want to receive notifications in my preferred language, so that I can understand all communications clearly.

**As a privacy-conscious user**, I want to easily opt out of all non-essential communications, so that I maintain control over my inbox and phone.

## Frontend Specifications

### Pages

#### Notification Preferences Page (`/account/notifications`)
- Grouped notification controls by channel (Email, Push, SMS)
- Separate toggle switches for each notification type
- Quiet hours configuration section
- Language preference selector
- Frequency controls for promotional content
- Save/Cancel buttons with unsaved changes warning
- Success/error notifications for preference updates
- Link to notification history/center

### UI Components

#### NotificationChannelToggle Component
- Toggle switch for each channel (Email, Push, SMS)
- Visual indicator of current state (on/off)
- Disabled state if channel not available (e.g., SMS requires phone verification)
- Tooltip explaining channel purpose
- Real-time toggle without page reload

#### NotificationTypeControl Component
- Grouped controls for notification categories:
  - Booking confirmations and updates
  - Payment confirmations and receipts
  - Trip reminders (24h before, 1h before pickup)
  - Promotional offers and deals
  - Platform updates and announcements
  - Price drop alerts
  - Favorite vehicle availability alerts
- Individual toggle for each type
- Visual hierarchy showing category grouping
- "Select All" / "Deselect All" quick actions per category

#### QuietHoursConfig Component
- Enable/disable quiet hours toggle
- Time picker for start time (e.g., 10:00 PM)
- Time picker for end time (e.g., 8:00 AM)
- Timezone display and selector
- Visual preview of quiet hours window
- Explanation text: "You won't receive notifications during these hours except for urgent booking updates"

#### FrequencyControl Component
- Slider or dropdown for promotional email frequency
- Options: Daily, Weekly, Bi-weekly, Monthly, Never
- Visual indicator of current selection
- Estimated emails per month display
- Applies only to promotional content, not transactional notifications

#### LanguageSelector Component
- Dropdown with supported languages
- Flag icons for visual recognition
- Search/filter for long language lists
- Current language highlighted
- Applies to all notification channels

### User Flows

#### Update Notification Preferences Flow
1. User navigates to Notification Preferences page
2. System displays current notification settings grouped by channel
3. User toggles notification channels on/off (Email, Push, SMS)
4. User selects/deselects specific notification types
5. User configures quiet hours (optional)
6. User sets promotional frequency (optional)
7. User selects preferred language (optional)
8. User clicks Save button
9. System validates preferences
10. System updates preferences in database
11. System displays success message
12. System sends confirmation email in preferred language
13. Preferences take effect immediately

#### Set Quiet Hours Flow
1. User enables quiet hours toggle
2. System displays time picker controls
3. User selects start time (e.g., 10:00 PM)
4. User selects end time (e.g., 8:00 AM)
5. System validates time range (end must be after start)
6. System displays visual preview of quiet hours window
7. User saves preferences
8. System applies quiet hours to all notification channels
9. System displays confirmation message
10. Urgent notifications (booking issues, payment failures) still delivered during quiet hours

### Data Requirements

#### Notification Preferences Data from Backend
- User ID
- Email notifications enabled (boolean)
- Push notifications enabled (boolean)
- SMS notifications enabled (boolean)
- Notification types preferences (object):
  - bookingConfirmations (boolean)
  - paymentReceipts (boolean)
  - tripReminders (boolean)
  - promotionalOffers (boolean)
  - platformUpdates (boolean)
  - priceAlerts (boolean)
  - availabilityAlerts (boolean)
- Quiet hours configuration:
  - enabled (boolean)
  - startTime (HH:mm format)
  - endTime (HH:mm format)
  - timezone (string)
- Promotional frequency (enum: daily, weekly, biweekly, monthly, never)
- Preferred language (ISO language code)
- Last updated timestamp

#### Notification History Data (Optional Enhancement)
- Notification ID
- Notification type
- Channel (email, push, SMS)
- Sent timestamp
- Delivery status (sent, delivered, failed, opened)
- Content preview
- Related booking/transaction ID

## Backend Specifications

### API Endpoints

#### GET /api/users/{userId}/notification-preferences
**Purpose**: Retrieve user's notification preferences

**Authentication**: Required (JWT token)

**Authorization**: User can only access their own preferences

**Request Parameters**:
- `userId` (path parameter): User ID

**Response Schema** (200 OK):
```json
{
  "userId": "string (UUID)",
  "channels": {
    "email": "boolean",
    "push": "boolean",
    "sms": "boolean"
  },
  "notificationTypes": {
    "bookingConfirmations": "boolean",
    "paymentReceipts": "boolean",
    "tripReminders": "boolean",
    "promotionalOffers": "boolean",
    "platformUpdates": "boolean",
    "priceAlerts": "boolean",
    "availabilityAlerts": "boolean"
  },
  "quietHours": {
    "enabled": "boolean",
    "startTime": "string (HH:mm)",
    "endTime": "string (HH:mm)",
    "timezone": "string"
  },
  "promotionalFrequency": "string (daily|weekly|biweekly|monthly|never)",
  "preferredLanguage": "string (ISO code)",
  "updatedAt": "string (ISO timestamp)"
}
```

**Error Responses**:
- 401 Unauthorized: Invalid or missing authentication token
- 403 Forbidden: User attempting to access another user's preferences
- 404 Not Found: User preferences not found

#### PUT /api/users/{userId}/notification-preferences
**Purpose**: Update user's notification preferences

**Authentication**: Required (JWT token)

**Authorization**: User can only update their own preferences

**Request Parameters**:
- `userId` (path parameter): User ID

**Request Body**:
```json
{
  "channels": {
    "email": "boolean (optional)",
    "push": "boolean (optional)",
    "sms": "boolean (optional)"
  },
  "notificationTypes": {
    "bookingConfirmations": "boolean (optional)",
    "paymentReceipts": "boolean (optional)",
    "tripReminders": "boolean (optional)",
    "promotionalOffers": "boolean (optional)",
    "platformUpdates": "boolean (optional)",
    "priceAlerts": "boolean (optional)",
    "availabilityAlerts": "boolean (optional)"
  },
  "quietHours": {
    "enabled": "boolean (optional)",
    "startTime": "string (HH:mm, optional)",
    "endTime": "string (HH:mm, optional)",
    "timezone": "string (optional)"
  },
  "promotionalFrequency": "string (daily|weekly|biweekly|monthly|never, optional)",
  "preferredLanguage": "string (ISO code, optional)"
}
```

**Response Schema** (200 OK):
```json
{
  "success": true,
  "message": "Notification preferences updated successfully",
  "preferences": { /* Updated preferences object */ }
}
```

**Error Responses**:
- 400 Bad Request: Invalid data format or validation errors
- 401 Unauthorized: Invalid or missing authentication token
- 403 Forbidden: User attempting to update another user's preferences

#### POST /api/users/{userId}/notification-preferences/test
**Purpose**: Send test notification to verify preferences

**Authentication**: Required (JWT token)

**Authorization**: User can only test their own preferences

**Request Parameters**:
- `userId` (path parameter): User ID

**Request Body**:
```json
{
  "channel": "string (email|push|sms)",
  "notificationType": "string (booking|payment|reminder|promotional)"
}
```

**Response Schema** (200 OK):
```json
{
  "success": true,
  "message": "Test notification sent successfully",
  "sentAt": "string (ISO timestamp)"
}
```

### Business Logic

#### Notification Delivery Logic
- Check if user has enabled the notification channel (email, push, SMS)
- Check if user has enabled the specific notification type
- Check if current time falls within quiet hours
- If within quiet hours: Only deliver urgent notifications (booking issues, payment failures)
- If outside quiet hours or urgent: Deliver notification
- Apply promotional frequency limits for promotional content
- Use preferred language for notification content
- Log notification delivery for audit trail

#### Quiet Hours Enforcement
- Convert quiet hours to UTC for consistent processing
- Check current time against quiet hours window
- Urgent notification types bypass quiet hours:
  - Booking cancellations by supplier
  - Payment failures requiring action
  - Vehicle unavailability for confirmed booking
  - Security alerts (suspicious login, password change)
- Non-urgent notifications queued until quiet hours end
- Maximum queue size: 50 notifications per user
- Queued notifications delivered in chronological order after quiet hours

#### Promotional Frequency Management
- Track promotional emails sent to user
- Calculate next allowed promotional email based on frequency setting
- Daily: Max 1 per day
- Weekly: Max 1 per 7 days
- Bi-weekly: Max 1 per 14 days
- Monthly: Max 1 per 30 days
- Never: No promotional emails sent
- Transactional emails (booking confirmations, receipts) not affected by frequency limits

#### Language Preference Application
- Use preferred language for all notification content
- Fall back to English if preferred language not supported
- Translate notification templates dynamically
- Store translations in database or use translation service
- Include language code in notification metadata

### Authentication Requirements

- All notification preference endpoints require valid JWT authentication token
- Token must contain userId claim matching the requested preferences
- Session must be active and not expired
- Rate limiting: 50 requests per minute per user for preference endpoints
- Rate limiting: 5 test notifications per hour per user

## Database Specifications

### Schema Changes

#### NotificationPreferences Table (New)
```sql
CREATE TABLE NotificationPreferences (
  preference_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL UNIQUE,
  email_enabled BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT TRUE,
  sms_enabled BOOLEAN DEFAULT FALSE,
  booking_confirmations BOOLEAN DEFAULT TRUE,
  payment_receipts BOOLEAN DEFAULT TRUE,
  trip_reminders BOOLEAN DEFAULT TRUE,
  promotional_offers BOOLEAN DEFAULT TRUE,
  platform_updates BOOLEAN DEFAULT TRUE,
  price_alerts BOOLEAN DEFAULT FALSE,
  availability_alerts BOOLEAN DEFAULT FALSE,
  quiet_hours_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  quiet_hours_timezone VARCHAR(50) DEFAULT 'UTC',
  promotional_frequency ENUM('daily', 'weekly', 'biweekly', 'monthly', 'never') DEFAULT 'weekly',
  preferred_language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  INDEX idx_user_notification_prefs (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### NotificationLog Table (New - Optional Enhancement)
```sql
CREATE TABLE NotificationLog (
  log_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  channel ENUM('email', 'push', 'sms') NOT NULL,
  subject VARCHAR(255),
  content_preview TEXT,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  delivery_status ENUM('sent', 'delivered', 'failed', 'opened', 'clicked') DEFAULT 'sent',
  related_booking_id VARCHAR(36),
  related_transaction_id VARCHAR(36),
  error_message TEXT,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  INDEX idx_user_notifications (user_id),
  INDEX idx_notification_type (notification_type),
  INDEX idx_sent_at (sent_at),
  INDEX idx_delivery_status (delivery_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### PromotionalEmailTracking Table (New)
```sql
CREATE TABLE PromotionalEmailTracking (
  tracking_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  campaign_id VARCHAR(36),
  opened BOOLEAN DEFAULT FALSE,
  clicked BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  INDEX idx_user_promotional_emails (user_id),
  INDEX idx_sent_at (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Relationships

- Users (1) → NotificationPreferences (1): One user has one notification preferences record
- Users (1) → NotificationLog (Many): One user can have many notification log entries
- Users (1) → PromotionalEmailTracking (Many): One user can have many promotional email tracking records

### Indexes

**Performance Optimization Indexes**:
- `idx_user_notification_prefs (user_id)`: Fast lookup of user notification preferences
- `idx_user_notifications (user_id)`: Fast lookup of user notification history
- `idx_notification_type (notification_type)`: Analytics on notification types
- `idx_sent_at (sent_at)`: Time-based queries for notification history
- `idx_delivery_status (delivery_status)`: Monitor notification delivery success rates
- `idx_user_promotional_emails (user_id)`: Fast lookup for promotional frequency enforcement

## Technology Stack

- **Backend**: .NET 8+ with C# and ASP.NET Core Web API
- **Database**: MySQL 8.0+ with InnoDB storage engine
- **Frontend**: Next.js 14+ with React 18+ and TypeScript
- **Authentication**: JWT tokens with .NET Identity
- **Email Service**: SendGrid, AWS SES, or similar for email notifications
- **SMS Service**: Twilio, AWS SNS, or similar for SMS notifications
- **Push Notification Service**: Firebase Cloud Messaging (FCM) or Apple Push Notification Service (APNS)
- **Translation Service**: i18next, AWS Translate, or similar for multi-language support

## Implementation Notes

### Default Notification Settings
- Enable all transactional notifications by default (booking confirmations, payment receipts, trip reminders)
- Enable promotional offers by default with weekly frequency
- Disable price alerts and availability alerts by default (opt-in features)
- Disable quiet hours by default
- Set preferred language based on browser locale or account registration language

### Quiet Hours Best Practices
- Store quiet hours in user's local timezone for accurate enforcement
- Convert to UTC for server-side processing
- Always deliver urgent notifications regardless of quiet hours
- Queue non-urgent notifications for delivery after quiet hours
- Limit queue size to prevent notification flooding after quiet hours end
- Provide clear explanation of which notifications bypass quiet hours

### Promotional Frequency Enforcement
- Track last promotional email sent timestamp
- Calculate next allowed promotional email based on frequency setting
- Skip promotional emails if frequency limit reached
- Log skipped promotional emails for analytics
- Reset frequency counter on preference change
- Provide transparency: Show users when they'll receive next promotional email

### Multi-Language Support
- Store notification templates in multiple languages
- Use translation service for dynamic content
- Fall back to English if preferred language not available
- Include language code in notification metadata for tracking
- Test notifications in all supported languages
- Provide language selector with flag icons for easy recognition

### Notification Testing
- Provide test notification feature for users to verify preferences
- Send test notifications immediately without frequency limits
- Mark test notifications clearly in subject/content
- Log test notifications separately from real notifications
- Limit test notifications to 5 per hour to prevent abuse

### Privacy and Compliance
- Respect user preferences at all times
- Provide easy opt-out for all non-essential communications
- Include unsubscribe link in all promotional emails
- Honor unsubscribe requests immediately
- Log all preference changes for audit trail
- Comply with CAN-SPAM Act, GDPR, and other regulations

### Performance Optimization
- Cache notification preferences in Redis for fast lookup
- Invalidate cache on preference updates
- Use database indexes for fast queries
- Batch notification delivery for efficiency
- Use message queues for asynchronous notification processing
- Monitor notification delivery success rates and optimize

### Mobile Considerations
- Request push notification permissions at appropriate time (not immediately on app launch)
- Explain benefits of push notifications before requesting permission
- Provide in-app notification center for users who disable push
- Optimize notification content for mobile screens
- Use rich notifications with images and actions when supported
- Handle notification taps to deep link to relevant app screens
