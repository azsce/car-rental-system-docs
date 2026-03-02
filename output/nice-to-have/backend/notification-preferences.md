# Feature: Notification Preferences (Backend)

## Overview

Backend implementation for Notification Preferences providing API endpoints, business logic, and data management for user notification settings across email, push, and SMS channels. Handles quiet hours enforcement, promotional frequency management, multi-language support, and notification delivery orchestration.

## Sprint Category

nice-to-have

## Feature ID

F-AM-007

## API Endpoints

### GET /api/users/{userId}/notification-preferences
Retrieve user's notification preferences with all channel and type settings.

### PUT /api/users/{userId}/notification-preferences
Update user's notification preferences with validation and immediate effect.

### POST /api/users/{userId}/notification-preferences/test
Send test notification to verify user's preference configuration.

### GET /api/users/{userId}/notifications/history
Retrieve notification history with filtering and pagination (optional enhancement).

## Business Logic

### Notification Delivery Decision Engine
- Evaluate channel enablement (email, push, SMS)
- Check notification type preferences
- Enforce quiet hours with urgent notification bypass
- Apply promotional frequency limits
- Select appropriate language for content
- Log delivery attempts and results

### Quiet Hours Processing
- Convert user timezone to UTC for consistent processing
- Identify urgent vs non-urgent notifications
- Queue non-urgent notifications during quiet hours
- Deliver queued notifications after quiet hours end
- Limit queue size to 50 notifications per user

### Promotional Frequency Management
- Track last promotional email timestamp per user
- Calculate next allowed promotional email based on frequency setting
- Enforce frequency limits: daily (1/day), weekly (1/7days), biweekly (1/14days), monthly (1/30days)
- Bypass frequency limits for transactional notifications
- Reset tracking on frequency preference change

### Multi-Language Content Selection
- Use preferred language from user preferences
- Fall back to English if preferred language unavailable
- Retrieve translated notification templates
- Apply language to subject, body, and call-to-action text
- Include language metadata in notification logs

## Technology Stack

- **Backend Framework**: .NET 8+ with C# and ASP.NET Core Web API
- **Database**: MySQL 8.0+ with InnoDB storage engine
- **Authentication**: JWT tokens with .NET Identity
- **Email Service**: SendGrid, AWS SES, or similar
- **SMS Service**: Twilio, AWS SNS, or similar
- **Push Service**: Firebase Cloud Messaging (FCM), Apple Push Notification Service (APNS)
- **Caching**: Redis for preference caching
- **Message Queue**: RabbitMQ, AWS SQS, or similar for asynchronous notification processing
