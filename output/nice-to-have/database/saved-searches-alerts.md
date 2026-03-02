# Feature: Saved Searches & Alerts (Database)

## Overview

Database schema design for the Saved Searches & Alerts feature, supporting persistent storage of user search criteria, alert preferences, notification history, share links, and execution analytics. The schema is optimized for fast retrieval, efficient alert processing, and comprehensive audit trails.

## Sprint Category

nice-to-have

## Feature ID

F-SD-013

## Schema Changes

### New Tables
- `saved_searches`: Core table storing user saved searches with criteria and preferences
- `saved_search_alerts`: Alert history and notification tracking
- `saved_search_shares`: Shared search link management
- `saved_search_executions`: Search execution logs and analytics

### Modified Tables
None - This is a new feature with no modifications to existing tables

## Table Definitions

### saved_searches

Primary table for storing user saved searches with search criteria, alert preferences, and metadata.

```sql
CREATE TABLE saved_searches (
    id VARCHAR(36) PRIMARY KEY COMMENT 'UUID primary key',
    user_id VARCHAR(36) NOT NULL COMMENT 'Foreign key to users table',
    name VARCHAR(100) NOT NULL COMMENT 'User-defined search name',
    search_criteria JSON NOT NULL COMMENT 'Search parameters as JSON',
    alert_preferences JSON NOT NULL COMMENT 'Alert configuration as JSON',
    is_paused BOOLEAN DEFAULT FALSE COMMENT 'Whether alerts are paused',
    is_deleted BOOLEAN DEFAULT FALSE COMMENT 'Soft delete flag',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
    last_executed_at DATETIME NULL COMMENT 'Last search execution timestamp',
    execution_count INT DEFAULT 0 COMMENT 'Total execution count',
    current_match_count INT DEFAULT 0 COMMENT 'Current matching vehicles count',
    last_notification_sent_at DATETIME NULL COMMENT 'Last alert sent timestamp',
    
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_last_executed_at (last_executed_at),
    INDEX idx_is_deleted (is_deleted),
    INDEX idx_user_active (user_id, is_deleted, is_paused),
    
    CONSTRAINT fk_saved_searches_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User saved vehicle searches with alert preferences';
```

**Column Details:**

- `id`: UUID primary key for unique identification
- `user_id`: References users table, cascade delete when user removed
- `name`: User-friendly name for the saved search (e.g., "NYC SUV July 4th")
- `search_criteria`: JSON object containing all search parameters:
  ```json
  {
    "pickupLocationId": "uuid",
    "returnLocationId": "uuid",
    "pickupDate": "2026-07-04T10:00:00Z",
    "returnDate": "2026-07-07T10:00:00Z",
    "vehicleType": "SUV",
    "filters": {
      "transmission": "automatic",
      "fuelType": "electric",
      "minSeats": 5,
      "maxPrice": 150.00,
      "features": ["gps", "bluetooth"]
    }
  }
  ```
- `alert_preferences`: JSON object containing notification settings:
  ```json
  {
    "priceDropEnabled": true,
    "priceDropThreshold": 10.0,
    "availabilityAlertEnabled": true,
    "notificationChannels": ["email", "push"],
    "notificationFrequency": "instant"
  }
  ```
- `is_paused`: Flag to temporarily disable alerts without deleting search
- `is_deleted`: Soft delete flag for audit trail retention
- `last_executed_at`: Timestamp of most recent search execution
- `execution_count`: Counter for analytics and usage tracking
- `current_match_count`: Cached count of matching vehicles from last execution
- `last_notification_sent_at`: Timestamp of most recent alert sent

### saved_search_alerts

Stores comprehensive alert history including delivery status and user interactions.

```sql
CREATE TABLE saved_search_alerts (
    id VARCHAR(36) PRIMARY KEY COMMENT 'UUID primary key',
    saved_search_id VARCHAR(36) NOT NULL COMMENT 'Foreign key to saved_searches',
    alert_type ENUM('price_drop', 'availability', 'new_match') NOT NULL COMMENT 'Type of alert',
    notification_channel ENUM('email', 'push', 'sms') NOT NULL COMMENT 'Delivery channel',
    sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Alert sent timestamp',
    delivered_at DATETIME NULL COMMENT 'Delivery confirmation timestamp',
    opened_at DATETIME NULL COMMENT 'User opened notification timestamp',
    clicked_at DATETIME NULL COMMENT 'User clicked through timestamp',
    alert_data JSON NOT NULL COMMENT 'Alert content and metadata',
    status ENUM('sent', 'delivered', 'failed', 'bounced') NOT NULL DEFAULT 'sent' COMMENT 'Delivery status',
    error_message TEXT NULL COMMENT 'Error details if delivery failed',
    
    INDEX idx_saved_search_id (saved_search_id),
    INDEX idx_sent_at (sent_at),
    INDEX idx_alert_type (alert_type),
    INDEX idx_status (status),
    INDEX idx_search_type_sent (saved_search_id, alert_type, sent_at),
    
    CONSTRAINT fk_alerts_saved_search 
        FOREIGN KEY (saved_search_id) 
        REFERENCES saved_searches(id) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Alert notification history and tracking';
```

**Column Details:**

- `id`: UUID primary key
- `saved_search_id`: References saved_searches table, cascade delete
- `alert_type`: Type of alert triggered (price drop, new availability, new match)
- `notification_channel`: Delivery method used (email, push notification, SMS)
- `sent_at`: When alert was sent from system
- `delivered_at`: When delivery was confirmed by provider (SendGrid, FCM, Twilio)
- `opened_at`: When user opened the notification (email open tracking, push open)
- `clicked_at`: When user clicked through to search results
- `alert_data`: JSON containing alert details:
  ```json
  {
    "searchName": "NYC SUV July 4th",
    "matchCount": 15,
    "priceDropPercentage": 15.5,
    "priceDropAmount": 23.25,
    "newVehicleCount": 3,
    "vehicleIds": ["uuid1", "uuid2"],
    "messageId": "sendgrid-message-id"
  }
  ```
- `status`: Current delivery status
- `error_message`: Detailed error if delivery failed

### saved_search_shares

Manages shareable links for saved searches with access tracking and expiration.

```sql
CREATE TABLE saved_search_shares (
    id VARCHAR(36) PRIMARY KEY COMMENT 'UUID primary key',
    saved_search_id VARCHAR(36) NOT NULL COMMENT 'Foreign key to saved_searches',
    share_token VARCHAR(64) UNIQUE NOT NULL COMMENT 'Unique share token',
    created_by_user_id VARCHAR(36) NOT NULL COMMENT 'User who created share',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Share creation timestamp',
    expires_at DATETIME NOT NULL COMMENT 'Share expiration timestamp',
    allow_modification BOOLEAN DEFAULT FALSE COMMENT 'Whether recipient can modify search',
    access_count INT DEFAULT 0 COMMENT 'Number of times accessed',
    last_accessed_at DATETIME NULL COMMENT 'Last access timestamp',
    last_accessed_ip VARCHAR(45) NULL COMMENT 'Last access IP address',
    is_revoked BOOLEAN DEFAULT FALSE COMMENT 'Whether share was manually revoked',
    
    INDEX idx_share_token (share_token),
    INDEX idx_saved_search_id (saved_search_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_created_by (created_by_user_id),
    INDEX idx_active_shares (saved_search_id, is_revoked, expires_at),
    
    CONSTRAINT fk_shares_saved_search 
        FOREIGN KEY (saved_search_id) 
        REFERENCES saved_searches(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_shares_creator 
        FOREIGN KEY (created_by_user_id) 
        REFERENCES users(id) 
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Shared search link management and tracking';
```

**Column Details:**

- `id`: UUID primary key
- `saved_search_id`: References saved_searches table, cascade delete
- `share_token`: Cryptographically secure random token (64 characters, URL-safe)
- `created_by_user_id`: User who created the share link
- `created_at`: When share link was created
- `expires_at`: When share link expires (default 30 days from creation)
- `allow_modification`: Whether recipient can modify search criteria
- `access_count`: Number of times share link was accessed
- `last_accessed_at`: Most recent access timestamp
- `last_accessed_ip`: IP address of last access (for security monitoring)
- `is_revoked`: Manual revocation flag (overrides expiration)

### saved_search_executions

Logs every search execution for analytics, performance monitoring, and audit trails.

```sql
CREATE TABLE saved_search_executions (
    id VARCHAR(36) PRIMARY KEY COMMENT 'UUID primary key',
    saved_search_id VARCHAR(36) NOT NULL COMMENT 'Foreign key to saved_searches',
    executed_by_user_id VARCHAR(36) NOT NULL COMMENT 'User who executed search',
    executed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Execution timestamp',
    match_count INT NOT NULL COMMENT 'Number of matching vehicles',
    execution_time_ms INT NOT NULL COMMENT 'Execution time in milliseconds',
    result_summary JSON NULL COMMENT 'Summary of search results',
    cache_hit BOOLEAN DEFAULT FALSE COMMENT 'Whether results came from cache',
    
    INDEX idx_saved_search_id (saved_search_id),
    INDEX idx_executed_at (executed_at),
    INDEX idx_executed_by (executed_by_user_id),
    INDEX idx_search_date (saved_search_id, executed_at),
    
    CONSTRAINT fk_executions_saved_search 
        FOREIGN KEY (saved_search_id) 
        REFERENCES saved_searches(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_executions_user 
        FOREIGN KEY (executed_by_user_id) 
        REFERENCES users(id) 
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Search execution logs and analytics';
```

**Column Details:**

- `id`: UUID primary key
- `saved_search_id`: References saved_searches table, cascade delete
- `executed_by_user_id`: User who triggered execution (may differ from owner for shared searches)
- `executed_at`: When search was executed
- `match_count`: Number of vehicles matching criteria
- `execution_time_ms`: Query execution time for performance monitoring
- `result_summary`: JSON containing result metadata:
  ```json
  {
    "priceRange": {"min": 50.00, "max": 200.00, "avg": 125.00},
    "vehicleTypes": {"SUV": 10, "Sedan": 5},
    "suppliers": {"Supplier A": 8, "Supplier B": 7},
    "availabilityStatus": "available"
  }
  ```
- `cache_hit`: Whether results were served from cache (for performance analysis)

## Relationships

### saved_searches → users
- **Type**: Many-to-one
- **Foreign Key**: `user_id` references `users.id`
- **On Delete**: CASCADE (delete all saved searches when user deleted)
- **On Update**: CASCADE
- **Description**: Each saved search belongs to one user; users can have multiple saved searches

### saved_search_alerts → saved_searches
- **Type**: Many-to-one
- **Foreign Key**: `saved_search_id` references `saved_searches.id`
- **On Delete**: CASCADE (delete all alerts when saved search deleted)
- **On Update**: CASCADE
- **Description**: Each alert belongs to one saved search; saved searches can have multiple alerts

### saved_search_shares → saved_searches
- **Type**: Many-to-one
- **Foreign Key**: `saved_search_id` references `saved_searches.id`
- **On Delete**: CASCADE (delete all shares when saved search deleted)
- **On Update**: CASCADE
- **Description**: Each share belongs to one saved search; saved searches can have multiple shares

### saved_search_shares → users (creator)
- **Type**: Many-to-one
- **Foreign Key**: `created_by_user_id` references `users.id`
- **On Delete**: SET NULL (retain share record for audit even if creator deleted)
- **On Update**: CASCADE
- **Description**: Each share is created by one user; users can create multiple shares

### saved_search_executions → saved_searches
- **Type**: Many-to-one
- **Foreign Key**: `saved_search_id` references `saved_searches.id`
- **On Delete**: CASCADE (delete execution history when saved search deleted)
- **On Update**: CASCADE
- **Description**: Each execution belongs to one saved search; saved searches can have multiple executions

### saved_search_executions → users (executor)
- **Type**: Many-to-one
- **Foreign Key**: `executed_by_user_id` references `users.id`
- **On Delete**: SET NULL (retain execution log for analytics even if user deleted)
- **On Update**: CASCADE
- **Description**: Each execution is performed by one user; users can execute multiple searches

## Indexes

### Performance Optimization Indexes

**saved_searches table:**
- `idx_user_id`: Fast retrieval of user's saved searches
- `idx_created_at`: Sorting by creation date
- `idx_last_executed_at`: Finding stale searches for cleanup
- `idx_is_deleted`: Filtering out soft-deleted records
- `idx_user_active`: Composite index for active searches per user (user_id, is_deleted, is_paused)

**saved_search_alerts table:**
- `idx_saved_search_id`: Fast alert history lookup
- `idx_sent_at`: Alert analytics and reporting by date
- `idx_alert_type`: Filtering alerts by type
- `idx_status`: Monitoring delivery success rates
- `idx_search_type_sent`: Composite index for alert queries (saved_search_id, alert_type, sent_at)

**saved_search_shares table:**
- `idx_share_token`: Fast share link resolution (most critical for public access)
- `idx_saved_search_id`: Finding all shares for a saved search
- `idx_expires_at`: Cleanup of expired shares
- `idx_created_by`: Finding shares created by specific user
- `idx_active_shares`: Composite index for active share queries (saved_search_id, is_revoked, expires_at)

**saved_search_executions table:**
- `idx_saved_search_id`: Execution history for specific search
- `idx_executed_at`: Analytics queries by date range
- `idx_executed_by`: User activity tracking
- `idx_search_date`: Composite index for execution history queries (saved_search_id, executed_at)

### Index Maintenance

**Monitoring:**
- Monitor index usage with `SHOW INDEX` and query performance
- Identify unused indexes for removal
- Track index size growth over time

**Optimization:**
- Rebuild indexes monthly: `OPTIMIZE TABLE saved_searches`
- Analyze table statistics: `ANALYZE TABLE saved_searches`
- Monitor slow query log for missing indexes

## Data Integrity Constraints

### Check Constraints

```sql
-- Ensure execution count is non-negative
ALTER TABLE saved_searches 
ADD CONSTRAINT chk_execution_count 
CHECK (execution_count >= 0);

-- Ensure match count is non-negative
ALTER TABLE saved_searches 
ADD CONSTRAINT chk_match_count 
CHECK (current_match_count >= 0);

-- Ensure access count is non-negative
ALTER TABLE saved_search_shares 
ADD CONSTRAINT chk_access_count 
CHECK (access_count >= 0);

-- Ensure execution time is positive
ALTER TABLE saved_search_executions 
ADD CONSTRAINT chk_execution_time 
CHECK (execution_time_ms > 0);

-- Ensure match count is non-negative
ALTER TABLE saved_search_executions 
ADD CONSTRAINT chk_exec_match_count 
CHECK (match_count >= 0);
```

### Unique Constraints

```sql
-- Ensure share tokens are unique
ALTER TABLE saved_search_shares 
ADD CONSTRAINT uk_share_token 
UNIQUE (share_token);

-- Prevent duplicate search names per user (optional, business decision)
-- ALTER TABLE saved_searches 
-- ADD CONSTRAINT uk_user_search_name 
-- UNIQUE (user_id, name, is_deleted);
```

## Migration Scripts

### Initial Schema Creation

```sql
-- Create saved_searches table
CREATE TABLE saved_searches (
    -- [Full table definition as shown above]
);

-- Create saved_search_alerts table
CREATE TABLE saved_search_alerts (
    -- [Full table definition as shown above]
);

-- Create saved_search_shares table
CREATE TABLE saved_search_shares (
    -- [Full table definition as shown above]
);

-- Create saved_search_executions table
CREATE TABLE saved_search_executions (
    -- [Full table definition as shown above]
);

-- Add check constraints
ALTER TABLE saved_searches ADD CONSTRAINT chk_execution_count CHECK (execution_count >= 0);
ALTER TABLE saved_searches ADD CONSTRAINT chk_match_count CHECK (current_match_count >= 0);
ALTER TABLE saved_search_shares ADD CONSTRAINT chk_access_count CHECK (access_count >= 0);
ALTER TABLE saved_search_executions ADD CONSTRAINT chk_execution_time CHECK (execution_time_ms > 0);
ALTER TABLE saved_search_executions ADD CONSTRAINT chk_exec_match_count CHECK (match_count >= 0);
```

### Rollback Script

```sql
-- Drop tables in reverse order (respecting foreign keys)
DROP TABLE IF EXISTS saved_search_executions;
DROP TABLE IF EXISTS saved_search_shares;
DROP TABLE IF EXISTS saved_search_alerts;
DROP TABLE IF EXISTS saved_searches;
```

## Data Retention and Archival

### Retention Policies

**saved_searches:**
- Soft delete inactive searches after 6 months of no execution
- Hard delete soft-deleted searches after 1 year
- Retain active searches indefinitely

**saved_search_alerts:**
- Retain alert history for 90 days
- Archive older alerts to cold storage
- Retain aggregate statistics indefinitely

**saved_search_shares:**
- Automatically expire shares after configured duration (default 30 days)
- Delete expired shares after 90 days
- Retain share analytics indefinitely

**saved_search_executions:**
- Retain detailed execution logs for 30 days
- Aggregate to daily summaries after 30 days
- Retain aggregated data for 2 years

### Archival Queries

```sql
-- Archive old alerts (move to archive table)
INSERT INTO saved_search_alerts_archive 
SELECT * FROM saved_search_alerts 
WHERE sent_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

DELETE FROM saved_search_alerts 
WHERE sent_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- Delete expired shares
DELETE FROM saved_search_shares 
WHERE expires_at < DATE_SUB(NOW(), INTERVAL 90 DAY) 
AND is_revoked = TRUE;

-- Soft delete inactive searches
UPDATE saved_searches 
SET is_deleted = TRUE 
WHERE last_executed_at < DATE_SUB(NOW(), INTERVAL 6 MONTH) 
AND is_deleted = FALSE;
```

## Performance Considerations

### Query Optimization

**Frequent Queries:**
1. Get user's active saved searches: Use `idx_user_active` composite index
2. Resolve share token: Use `idx_share_token` unique index
3. Get alert history: Use `idx_search_type_sent` composite index
4. Find expired shares: Use `idx_expires_at` index

**Slow Query Prevention:**
- Avoid full table scans on JSON columns
- Use generated columns for frequently queried JSON fields
- Implement pagination for large result sets
- Use EXPLAIN to analyze query plans

### JSON Column Optimization

```sql
-- Add generated columns for frequently queried JSON fields
ALTER TABLE saved_searches 
ADD COLUMN pickup_location_id VARCHAR(36) 
GENERATED ALWAYS AS (JSON_UNQUOTE(JSON_EXTRACT(search_criteria, '$.pickupLocationId'))) STORED,
ADD INDEX idx_pickup_location (pickup_location_id);

ALTER TABLE saved_searches 
ADD COLUMN pickup_date DATETIME 
GENERATED ALWAYS AS (JSON_UNQUOTE(JSON_EXTRACT(search_criteria, '$.pickupDate'))) STORED,
ADD INDEX idx_pickup_date (pickup_date);
```

### Partitioning Strategy

For high-volume deployments, consider partitioning large tables:

```sql
-- Partition saved_search_alerts by month
ALTER TABLE saved_search_alerts 
PARTITION BY RANGE (YEAR(sent_at) * 100 + MONTH(sent_at)) (
    PARTITION p202601 VALUES LESS THAN (202602),
    PARTITION p202602 VALUES LESS THAN (202603),
    PARTITION p202603 VALUES LESS THAN (202604),
    -- Add partitions as needed
    PARTITION pmax VALUES LESS THAN MAXVALUE
);

-- Partition saved_search_executions by month
ALTER TABLE saved_search_executions 
PARTITION BY RANGE (YEAR(executed_at) * 100 + MONTH(executed_at)) (
    PARTITION p202601 VALUES LESS THAN (202602),
    PARTITION p202602 VALUES LESS THAN (202603),
    -- Add partitions as needed
    PARTITION pmax VALUES LESS THAN MAXVALUE
);
```

## Security Considerations

### Data Protection

**Sensitive Data:**
- Search criteria may contain personal preferences
- Alert preferences reveal user behavior patterns
- Execution logs contain usage patterns

**Protection Measures:**
- Encrypt JSON columns containing sensitive data
- Implement row-level security for multi-tenant scenarios
- Audit access to saved searches and execution logs
- Anonymize data for analytics and reporting

### Access Control

**Database User Permissions:**
- Application user: SELECT, INSERT, UPDATE, DELETE on all tables
- Analytics user: SELECT only on execution and alert tables
- Backup user: SELECT only on all tables
- Admin user: Full permissions for maintenance

### SQL Injection Prevention

- Use parameterized queries exclusively
- Validate and sanitize all user input
- Escape JSON string values properly
- Use ORM (Entity Framework Core) for query generation

## Technology Stack

- **Database**: MySQL 8.0+ with InnoDB storage engine
- **Character Set**: utf8mb4 for full Unicode support
- **Collation**: utf8mb4_unicode_ci for case-insensitive comparisons
- **Storage Engine**: InnoDB for ACID compliance and foreign key support
- **JSON Support**: Native JSON data type with validation and indexing

## Implementation Notes

### Initial Data Population

No initial data required. Tables start empty and populate as users create saved searches.

### Testing Data

```sql
-- Insert test saved search
INSERT INTO saved_searches (id, user_id, name, search_criteria, alert_preferences) 
VALUES (
    UUID(),
    'test-user-uuid',
    'Test Search',
    '{"pickupLocationId": "loc-1", "pickupDate": "2026-07-01T10:00:00Z", "returnDate": "2026-07-05T10:00:00Z"}',
    '{"priceDropEnabled": true, "priceDropThreshold": 10.0, "notificationChannels": ["email"]}'
);
```

### Monitoring Queries

```sql
-- Count active saved searches per user
SELECT user_id, COUNT(*) as search_count 
FROM saved_searches 
WHERE is_deleted = FALSE AND is_paused = FALSE 
GROUP BY user_id 
ORDER BY search_count DESC;

-- Alert delivery success rate
SELECT 
    alert_type,
    COUNT(*) as total,
    SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
    ROUND(SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) as success_rate
FROM saved_search_alerts 
WHERE sent_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY alert_type;

-- Average execution time
SELECT 
    DATE(executed_at) as date,
    AVG(execution_time_ms) as avg_time_ms,
    MAX(execution_time_ms) as max_time_ms
FROM saved_search_executions 
WHERE executed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(executed_at)
ORDER BY date DESC;
```
