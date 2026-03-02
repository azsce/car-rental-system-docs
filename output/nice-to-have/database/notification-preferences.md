# Feature: Notification Preferences (Database)

## Overview

Database schema for storing user notification preferences including channel settings, notification type preferences, quiet hours configuration, promotional frequency settings, and notification delivery logs.

## Sprint Category

nice-to-have

## Feature ID

F-AM-007

## Schema Changes

### NotificationPreferences Table
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

### NotificationLog Table
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

### PromotionalEmailTracking Table
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

## Relationships

- Users (1) → NotificationPreferences (1): One user has one notification preferences record
- Users (1) → NotificationLog (Many): One user can have many notification log entries
- Users (1) → PromotionalEmailTracking (Many): One user can have many promotional email tracking records

## Indexes

- `idx_user_notification_prefs (user_id)`: Fast lookup of user notification preferences
- `idx_user_notifications (user_id)`: Fast lookup of user notification history
- `idx_notification_type (notification_type)`: Analytics on notification types
- `idx_sent_at (sent_at)`: Time-based queries for notification history
- `idx_delivery_status (delivery_status)`: Monitor notification delivery success rates
- `idx_user_promotional_emails (user_id)`: Fast lookup for promotional frequency enforcement

## Technology Stack

- **Database**: MySQL 8.0+ with InnoDB storage engine
