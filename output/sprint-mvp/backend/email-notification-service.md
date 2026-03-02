# Feature: Email Notification Service

## Overview

The Email Notification Service provides reliable email delivery for transactional messages including booking confirmations, receipts, password resets, and customer communications. This service integrates with third-party email providers to ensure high deliverability rates, template management, and comprehensive tracking capabilities.

## Sprint Category

sprint-mvp

## Feature IDs

F-INT-NOTIF-001

## User Stories

As a customer, I want to receive email confirmations for my bookings, so that I have a record of my reservation and pickup details.

As a customer, I want to receive password reset emails, so that I can regain access to my account securely.

As a platform administrator, I want to track email delivery status, so that I can ensure customers receive critical communications.

As a support agent, I want to view email delivery history, so that I can troubleshoot customer communication issues.

## Frontend Specifications

### Pages

Not applicable - email notifications are backend-triggered and delivered externally.

### UI Components

**Email Preference Settings**
- Toggle for email notifications
- Email address verification status
- Notification type preferences (booking, marketing, updates)
- Test email button

### User Flows

1. User completes booking
2. System triggers booking confirmation email
3. User receives email with booking details
4. User can click links in email to view booking or contact support

### Data Requirements

- User email address
- Email delivery status
- Bounce and complaint tracking
- Email open and click tracking

## Backend Specifications

### API Endpoints

**POST /api/notifications/email/send**
- Purpose: Send transactional email
- Authentication: Internal service authentication
- Request body: Email template ID, recipient, dynamic data
- Response: Email job ID, queued status

**GET /api/notifications/email/{emailId}/status**
- Purpose: Check email delivery status
- Authentication: JWT token (admin or user for own emails)
- Response: Delivery status, timestamps, events

**POST /api/notifications/email/webhook**
- Purpose: Receive delivery status updates from email provider
- Authentication: Webhook signature verification
- Request body: Provider-specific webhook payload
- Response: 200 OK acknowledgment

**GET /api/notifications/email/history**
- Purpose: Retrieve email history for user or admin
- Authentication: JWT token
- Query parameters: userId, startDate, endDate, status, limit, offset
- Response: Paginated list of sent emails with status

### Request Schemas

**Send Email Request**
```
{
  "templateId": "booking-confirmation",
  "recipient": {
    "email": "customer@example.com",
    "name": "John Doe"
  },
  "data": {
    "bookingReference": "BK-12345",
    "vehicleName": "Toyota Camry",
    "pickupDate": "2026-03-01T10:00:00Z",
    "pickupLocation": "Downtown Branch"
  },
  "priority": "high",
  "scheduledAt": null
}
```

### Response Schemas

**Send Email Response**
```
{
  "emailId": "em_abc123xyz",
  "status": "queued",
  "queuedAt": "2026-02-24T14:30:00Z",
  "estimatedDelivery": "2026-02-24T14:30:05Z"
}
```

**Email Status Response**
```
{
  "emailId": "em_abc123xyz",
  "status": "delivered",
  "recipient": "customer@example.com",
  "templateId": "booking-confirmation",
  "sentAt": "2026-02-24T14:30:02Z",
  "deliveredAt": "2026-02-24T14:30:05Z",
  "openedAt": "2026-02-24T14:35:12Z",
  "clickedAt": "2026-02-24T14:36:00Z",
  "events": [
    {
      "type": "queued",
      "timestamp": "2026-02-24T14:30:00Z"
    },
    {
      "type": "sent",
      "timestamp": "2026-02-24T14:30:02Z"
    },
    {
      "type": "delivered",
      "timestamp": "2026-02-24T14:30:05Z"
    },
    {
      "type": "opened",
      "timestamp": "2026-02-24T14:35:12Z"
    }
  ]
}
```

### Business Logic

**Email Provider Integration**
- Integrate with SendGrid, Mailgun, Amazon SES, or Postmark
- Configure API credentials and sender domains
- Implement provider-specific API clients
- Handle provider-specific error codes and retry logic

**Template Management**
- Store email templates with version control
- Support dynamic content placeholders
- Implement template rendering engine
- Support multi-language templates based on user preference

**Delivery Tracking**
- Store email metadata in database
- Process webhook events from email provider
- Update delivery status in real-time
- Track opens, clicks, bounces, and complaints

**Bounce and Complaint Handling**
- Process bounce notifications (hard and soft bounces)
- Mark email addresses with repeated bounces as invalid
- Handle spam complaints and unsubscribe requests
- Maintain suppression list for bounced/complained addresses

**Queue Management**
- Use message queue for asynchronous email sending
- Implement retry logic for failed deliveries
- Priority queue for critical emails (booking confirmations)
- Rate limiting to comply with provider limits

### Authentication Requirements

- Internal service authentication for email sending
- JWT token authentication for status queries
- Webhook signature verification for provider callbacks
- Admin role required for viewing all email history

## Database Specifications

### Schema Changes

Create new tables for email tracking and template management.

### Table Definitions

**EmailNotifications**
- EmailId (VARCHAR(50), PRIMARY KEY): Unique email identifier
- UserId (VARCHAR(50), FOREIGN KEY): Recipient user ID
- RecipientEmail (VARCHAR(255), NOT NULL): Recipient email address
- RecipientName (VARCHAR(255)): Recipient display name
- TemplateId (VARCHAR(100), NOT NULL): Email template identifier
- Subject (VARCHAR(500), NOT NULL): Email subject line
- Status (ENUM: queued, sent, delivered, bounced, failed, opened, clicked): Delivery status
- Priority (ENUM: low, normal, high, critical): Email priority
- ScheduledAt (DATETIME, NULL): Scheduled send time
- QueuedAt (DATETIME, NOT NULL): Time added to queue
- SentAt (DATETIME, NULL): Time sent to provider
- DeliveredAt (DATETIME, NULL): Time delivered to recipient
- OpenedAt (DATETIME, NULL): First open timestamp
- ClickedAt (DATETIME, NULL): First click timestamp
- BouncedAt (DATETIME, NULL): Bounce timestamp
- BounceReason (TEXT, NULL): Bounce error message
- ProviderMessageId (VARCHAR(255), NULL): Provider's message ID
- TemplateData (JSON, NOT NULL): Dynamic template data
- CreatedAt (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- UpdatedAt (DATETIME, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

**EmailTemplates**
- TemplateId (VARCHAR(100), PRIMARY KEY): Template identifier
- TemplateName (VARCHAR(255), NOT NULL): Human-readable name
- Subject (VARCHAR(500), NOT NULL): Email subject with placeholders
- HtmlBody (TEXT, NOT NULL): HTML email body
- TextBody (TEXT, NOT NULL): Plain text fallback
- Language (VARCHAR(10), DEFAULT 'en'): Template language
- Version (INT, DEFAULT 1): Template version number
- IsActive (BOOLEAN, DEFAULT TRUE): Active status
- CreatedAt (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- UpdatedAt (DATETIME, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

**EmailEvents**
- EventId (INT, AUTO_INCREMENT, PRIMARY KEY)
- EmailId (VARCHAR(50), FOREIGN KEY): Reference to EmailNotifications
- EventType (ENUM: queued, sent, delivered, bounced, opened, clicked, complained, unsubscribed): Event type
- EventData (JSON, NULL): Additional event metadata
- Timestamp (DATETIME, NOT NULL): Event occurrence time
- CreatedAt (DATETIME, DEFAULT CURRENT_TIMESTAMP)

**EmailSuppressionList**
- SuppressionId (INT, AUTO_INCREMENT, PRIMARY KEY)
- Email (VARCHAR(255), UNIQUE, NOT NULL): Suppressed email address
- Reason (ENUM: bounce, complaint, unsubscribe, manual): Suppression reason
- BounceType (ENUM: hard, soft, NULL): Bounce classification
- AddedAt (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- ExpiresAt (DATETIME, NULL): Expiration for soft bounces

### Relationships

- EmailNotifications.UserId → Users.UserId (many-to-one)
- EmailEvents.EmailId → EmailNotifications.EmailId (many-to-one)

### Indexes

- EmailNotifications: Index on (UserId, CreatedAt) for user history queries
- EmailNotifications: Index on (Status, QueuedAt) for queue processing
- EmailNotifications: Index on (ProviderMessageId) for webhook lookups
- EmailEvents: Index on (EmailId, Timestamp) for event history
- EmailSuppressionList: Unique index on (Email) for fast lookups

## Technology Stack

- Backend: .NET 8+ with C#, ASP.NET Core Web API
- Database: MySQL 8.0+
- Email Provider: SendGrid, Mailgun, Amazon SES, or Postmark
- Message Queue: RabbitMQ or Azure Service Bus for async processing
- Template Engine: Razor or Handlebars for email rendering

## Implementation Notes

**Provider Selection Criteria**
- Deliverability reputation and rates
- API reliability and documentation quality
- Pricing structure (pay-per-email vs monthly)
- Template management capabilities
- Webhook support for delivery tracking
- Multi-language and internationalization support

**Email Best Practices**
- Use authenticated sender domains (SPF, DKIM, DMARC)
- Implement double opt-in for marketing emails
- Include unsubscribe links in all marketing communications
- Respect user notification preferences
- Monitor bounce rates and sender reputation
- Test emails across multiple clients (Gmail, Outlook, mobile)

**Performance Considerations**
- Use message queue to prevent blocking API requests
- Batch email sending where appropriate
- Implement exponential backoff for retries
- Cache email templates to reduce database queries
- Use connection pooling for provider API calls

**Compliance Requirements**
- CAN-SPAM Act compliance (US)
- GDPR compliance for EU customers
- Include physical mailing address in emails
- Honor unsubscribe requests within 10 business days
- Maintain consent records for marketing emails

**Monitoring and Alerts**
- Track delivery rate, bounce rate, complaint rate
- Alert on sudden drops in delivery rate
- Monitor provider API response times
- Track queue depth and processing lag
- Dashboard for email performance metrics

## Source Documentation

- docs/05-features/integration/notification-services.md
