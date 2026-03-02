# Feature: Favorite Vehicles (Database)

## Overview

Database schema design for the Favorite Vehicles feature, supporting persistent storage of user favorite vehicles, alert preferences, price history tracking, notification logs, and share link management. The schema is optimized for fast lookups, efficient price monitoring, and comprehensive analytics.

## Sprint Category

nice-to-have

## Feature ID

F-SD-014

## Schema Changes

### New Tables
- `favorite_vehicles`: Core table storing user favorite vehicles with alert preferences
- `favorite_vehicle_alerts`: Alert notification history and tracking
- `favorite_vehicle_shares`: Shared favorites list management
- `favorite_price_history`: Historical price tracking for trend analysis

### Modified Tables
None - This is a new feature with no modifications to existing tables

## Table Definitions

### favorite_vehicles

Primary table for storing user favorite vehicles with alert preferences and metadata.

```sql
CREATE TABLE favorite_vehicles (
    id VARCHAR(36) PRIMARY KEY COMMENT 'UUID primary key',
    user_id VARCHAR(36) NOT NULL COMMENT 'Foreign key to users table',
    vehicle_id VARCHAR(36) NOT NULL COMMENT 'Foreign key to vehicles table',
    notes TEXT NULL COMMENT 'User notes about this favorite',
    alert_preferences JSON NOT NULL COMMENT 'Alert configuration as JSON',
    added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When favorite was added',
    last_viewed_at DATETIME NULL COMMENT 'Last time user viewed this favorite',
    view_count INT DEFAULT 0 COMMENT 'Number of times viewed',
    preferred_pickup_date DATETIME NULL COMMENT 'User preferred pickup date for availability monitoring',
    preferred_return_date DATETIME NULL COMMENT 'User preferred return date for availability monitoring',
    preferred_location_id VARCHAR(36) NULL COMMENT 'Preferred pickup location',
    is_deleted BOOLEAN DEFAULT FALSE COMMENT 'Soft delete flag',
    deleted_at DATETIME NULL COMMENT 'When favorite was deleted',
    
    UNIQUE KEY uk_user_vehicle (user_id, vehicle_id, is_deleted),
    INDEX idx_user_id (user_id),
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_added_at (added_at),
    INDEX idx_is_deleted (is_deleted),
    INDEX idx_user_active (user_id, is_deleted),
    INDEX idx_preferred_dates (preferred_pickup_date, preferred_return_date),
    
    CONSTRAINT fk_favorites_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_favorites_vehicle 
        FOREIGN KEY (vehicle_id) 
        REFERENCES vehicles(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_favorites_location 
        FOREIGN KEY (preferred_location_id) 
        REFERENCES locations(id) 
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User favorite vehicles with alert preferences';
```

**Column Details:**

- `id`: UUID primary key for unique identification
- `user_id`: References users table, cascade delete when user removed
- `vehicle_id`: References vehicles table, cascade delete when vehicle removed
- `notes`: Optional user notes about why they favorited this vehicle
- `alert_preferences`: JSON object containing notification settings:
  ```json
  {
    "priceChangeEnabled": true,
    "priceChangeThreshold": 5.0,
    "availabilityAlertEnabled": true,
    "notificationChannels": ["email", "push"]
  }
  ```
- `added_at`: Timestamp when favorite was created
- `last_viewed_at`: Timestamp of most recent view (for analytics)
- `view_count`: Counter for how many times user viewed this favorite
- `preferred_pickup_date`: Optional date for availability monitoring
- `preferred_return_date`: Optional date for availability monitoring
- `preferred_location_id`: Optional preferred pickup location
- `is_deleted`: Soft delete flag for audit trail
- `deleted_at`: Timestamp when favorite was soft deleted

### favorite_vehicle_alerts

Stores comprehensive alert history including delivery status and user interactions.

```sql
CREATE TABLE favorite_vehicle_alerts (
    id VARCHAR(36) PRIMARY KEY COMMENT 'UUID primary key',
    favorite_id VARCHAR(36) NOT NULL COMMENT 'Foreign key to favorite_vehicles',
    alert_type ENUM('price_change', 'price_drop', 'availability', 'back_in_stock') NOT NULL COMMENT 'Type of alert',
    notification_channel ENUM('email', 'push', 'sms') NOT NULL COMMENT 'Delivery channel',
    sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Alert sent timestamp',
    delivered_at DATETIME NULL COMMENT 'Delivery confirmation timestamp',
    opened_at DATETIME NULL COMMENT 'User opened notification timestamp',
    clicked_at DATETIME NULL COMMENT 'User clicked through timestamp',
    alert_data JSON NOT NULL COMMENT 'Alert content and metadata',
    status ENUM('sent', 'delivered', 'failed', 'bounced', 'opened', 'clicked') NOT NULL DEFAULT 'sent' COMMENT 'Delivery status',
    error_message TEXT NULL COMMENT 'Error details if delivery failed',
    external_message_id VARCHAR(255) NULL COMMENT 'External service message ID (SendGrid, FCM)',
    
    INDEX idx_favorite_id (favorite_id),
    INDEX idx_sent_at (sent_at),
    INDEX idx_alert_type (alert_type),
    INDEX idx_status (status),
    INDEX idx_favorite_type_sent (favorite_id, alert_type, sent_at),
    INDEX idx_external_message_id (external_message_id),
    
    CONSTRAINT fk_alerts_favorite 
        FOREIGN KEY (favorite_id) 
        REFERENCES favorite_vehicles(id) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Alert notification history and tracking';
```

**Column Details:**

- `id`: UUID primary key
- `favorite_id`: References favorite_vehicles table, cascade delete
- `alert_type`: Type of alert (price change, price drop, availability, back in stock)
- `notification_channel`: Delivery method (email, push notification, SMS)
- `sent_at`: When alert was sent from system
- `delivered_at`: When delivery was confirmed by provider
- `opened_at`: When user opened the notification
- `clicked_at`: When user clicked through to vehicle details
- `alert_data`: JSON containing alert details:
  ```json
  {
    "vehicleName": "Tesla Model 3",
    "vehicleImageUrl": "https://...",
    "oldPrice": 150.00,
    "newPrice": 127.50,
    "priceChange": -22.50,
    "priceChangePercentage": -15.0,
    "availabilityStatus": "available",
    "bookingUrl": "https://..."
  }
  ```
- `status`: Current delivery and interaction status
- `error_message`: Detailed error if delivery failed
- `external_message_id`: Message ID from external service for tracking

### favorite_vehicle_shares

Manages shareable links for favorites lists with access tracking and security.

```sql
CREATE TABLE favorite_vehicle_shares (
    id VARCHAR(36) PRIMARY KEY COMMENT 'UUID primary key',
    user_id VARCHAR(36) NOT NULL COMMENT 'User who created share',
    share_token VARCHAR(64) UNIQUE NOT NULL COMMENT 'Unique share token',
    is_public BOOLEAN DEFAULT TRUE COMMENT 'Whether share is public or password-protected',
    password_hash VARCHAR(255) NULL COMMENT 'Bcrypt hash of password if protected',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Share creation timestamp',
    expires_at DATETIME NOT NULL COMMENT 'Share expiration timestamp',
    access_count INT DEFAULT 0 COMMENT 'Number of times accessed',
    last_accessed_at DATETIME NULL COMMENT 'Last access timestamp',
    last_accessed_ip VARCHAR(45) NULL COMMENT 'Last access IP address (IPv4 or IPv6)',
    is_revoked BOOLEAN DEFAULT FALSE COMMENT 'Whether share was manually revoked',
    revoked_at DATETIME NULL COMMENT 'When share was revoked',
    
    INDEX idx_share_token (share_token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_is_revoked (is_revoked),
    INDEX idx_active_shares (user_id, is_revoked, expires_at),
    
    CONSTRAINT fk_shares_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Shared favorites list management and tracking';
```

**Column Details:**

- `id`: UUID primary key
- `user_id`: User who created the share link
- `share_token`: Cryptographically secure random token (64 characters, URL-safe base64)
- `is_public`: Whether share is publicly accessible or requires password
- `password_hash`: Bcrypt hash of password if share is protected
- `created_at`: When share link was created
- `expires_at`: When share link expires (default 30 days from creation)
- `access_count`: Number of times share link was accessed
- `last_accessed_at`: Most recent access timestamp
- `last_accessed_ip`: IP address of last access (for security monitoring)
- `is_revoked`: Manual revocation flag (overrides expiration)
- `revoked_at`: When share was manually revoked

### favorite_price_history

Tracks historical pricing for favorited vehicles to enable trend analysis and charting.

```sql
CREATE TABLE favorite_price_history (
    id VARCHAR(36) PRIMARY KEY COMMENT 'UUID primary key',
    favorite_id VARCHAR(36) NOT NULL COMMENT 'Foreign key to favorite_vehicles',
    price DECIMAL(10,2) NOT NULL COMMENT 'Vehicle price at check time',
    currency VARCHAR(3) NOT NULL DEFAULT 'USD' COMMENT 'Price currency code',
    checked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When price was checked',
    price_change DECIMAL(10,2) NULL COMMENT 'Change from previous price',
    price_change_percentage DECIMAL(5,2) NULL COMMENT 'Percentage change from previous price',
    availability_status ENUM('available', 'limited', 'unavailable') NULL COMMENT 'Availability at check time',
    
    INDEX idx_favorite_id (favorite_id),
    INDEX idx_checked_at (checked_at),
    INDEX idx_favorite_checked (favorite_id, checked_at),
    
    CONSTRAINT fk_price_history_favorite 
        FOREIGN KEY (favorite_id) 
        REFERENCES favorite_vehicles(id) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Historical price tracking for favorited vehicles';
```

**Column Details:**

- `id`: UUID primary key
- `favorite_id`: References favorite_vehicles table, cascade delete
- `price`: Vehicle price at the time of check
- `currency`: Currency code (ISO 4217, e.g., USD, EUR, GBP)
- `checked_at`: Timestamp when price was checked
- `price_change`: Absolute change from previous price (can be negative)
- `price_change_percentage`: Percentage change from previous price
- `availability_status`: Vehicle availability at time of price check

## Relationships

### favorite_vehicles → users
- **Type**: Many-to-one
- **Foreign Key**: `user_id` references `users.id`
- **On Delete**: CASCADE (delete all favorites when user deleted)
- **On Update**: CASCADE
- **Description**: Each favorite belongs to one user; users can have multiple favorites

### favorite_vehicles → vehicles
- **Type**: Many-to-one
- **Foreign Key**: `vehicle_id` references `vehicles.id`
- **On Delete**: CASCADE (delete all favorites when vehicle deleted)
- **On Update**: CASCADE
- **Description**: Each favorite references one vehicle; vehicles can be favorited by multiple users

### favorite_vehicles → locations
- **Type**: Many-to-one (optional)
- **Foreign Key**: `preferred_location_id` references `locations.id`
- **On Delete**: SET NULL (clear location preference if location deleted)
- **On Update**: CASCADE
- **Description**: Each favorite can have one preferred location; locations can be preferred by multiple favorites

### favorite_vehicle_alerts → favorite_vehicles
- **Type**: Many-to-one
- **Foreign Key**: `favorite_id` references `favorite_vehicles.id`
- **On Delete**: CASCADE (delete all alerts when favorite deleted)
- **On Update**: CASCADE
- **Description**: Each alert belongs to one favorite; favorites can have multiple alerts

### favorite_vehicle_shares → users
- **Type**: Many-to-one
- **Foreign Key**: `user_id` references `users.id`
- **On Delete**: CASCADE (delete all shares when user deleted)
- **On Update**: CASCADE
- **Description**: Each share is created by one user; users can create multiple shares

### favorite_price_history → favorite_vehicles
- **Type**: Many-to-one
- **Foreign Key**: `favorite_id` references `favorite_vehicles.id`
- **On Delete**: CASCADE (delete price history when favorite deleted)
- **On Update**: CASCADE
- **Description**: Each price record belongs to one favorite; favorites can have multiple price records

## Indexes

### Performance Optimization Indexes

**favorite_vehicles table:**
- `uk_user_vehicle`: Unique constraint preventing duplicate favorites (composite: user_id, vehicle_id, is_deleted)
- `idx_user_id`: Fast retrieval of user's favorites
- `idx_vehicle_id`: Find all users who favorited a specific vehicle
- `idx_added_at`: Sorting favorites by date added
- `idx_is_deleted`: Filtering out soft-deleted records
- `idx_user_active`: Composite index for active favorites queries (user_id, is_deleted)
- `idx_preferred_dates`: Finding favorites with date preferences for availability monitoring

**favorite_vehicle_alerts table:**
- `idx_favorite_id`: Fast alert history lookup for specific favorite
- `idx_sent_at`: Alert analytics and reporting by date
- `idx_alert_type`: Filtering alerts by type
- `idx_status`: Monitoring delivery success rates
- `idx_favorite_type_sent`: Composite index for alert queries (favorite_id, alert_type, sent_at)
- `idx_external_message_id`: Tracking external service message status

**favorite_vehicle_shares table:**
- `idx_share_token`: Fast share link resolution (most critical for public access)
- `idx_user_id`: Finding all shares created by user
- `idx_expires_at`: Cleanup of expired shares
- `idx_is_revoked`: Filtering revoked shares
- `idx_active_shares`: Composite index for active share queries (user_id, is_revoked, expires_at)

**favorite_price_history table:**
- `idx_favorite_id`: Price history for specific favorite
- `idx_checked_at`: Time-series queries by date
- `idx_favorite_checked`: Composite index for price trend queries (favorite_id, checked_at)

### Index Maintenance

**Monitoring:**
```sql
-- Check index usage
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    SEQ_IN_INDEX,
    COLUMN_NAME,
    CARDINALITY
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'car_rental'
AND TABLE_NAME LIKE 'favorite%'
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- Identify unused indexes
SELECT 
    object_schema,
    object_name,
    index_name
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE index_name IS NOT NULL
AND count_star = 0
AND object_schema = 'car_rental'
AND object_name LIKE 'favorite%';
```

**Optimization:**
```sql
-- Rebuild indexes monthly
OPTIMIZE TABLE favorite_vehicles;
OPTIMIZE TABLE favorite_vehicle_alerts;
OPTIMIZE TABLE favorite_vehicle_shares;
OPTIMIZE TABLE favorite_price_history;

-- Analyze table statistics
ANALYZE TABLE favorite_vehicles;
ANALYZE TABLE favorite_vehicle_alerts;
ANALYZE TABLE favorite_vehicle_shares;
ANALYZE TABLE favorite_price_history;
```

## Data Integrity Constraints

### Check Constraints

```sql
-- Ensure view count is non-negative
ALTER TABLE favorite_vehicles 
ADD CONSTRAINT chk_view_count 
CHECK (view_count >= 0);

-- Ensure preferred return date is after pickup date
ALTER TABLE favorite_vehicles 
ADD CONSTRAINT chk_date_order 
CHECK (preferred_return_date IS NULL OR preferred_pickup_date IS NULL OR preferred_return_date > preferred_pickup_date);

-- Ensure access count is non-negative
ALTER TABLE favorite_vehicle_shares 
ADD CONSTRAINT chk_access_count 
CHECK (access_count >= 0);

-- Ensure price is positive
ALTER TABLE favorite_price_history 
ADD CONSTRAINT chk_price_positive 
CHECK (price > 0);

-- Ensure currency code is 3 characters
ALTER TABLE favorite_price_history 
ADD CONSTRAINT chk_currency_length 
CHECK (LENGTH(currency) = 3);
```

### Triggers

```sql
-- Trigger to update view count and last_viewed_at
DELIMITER //
CREATE TRIGGER trg_update_favorite_view
BEFORE UPDATE ON favorite_vehicles
FOR EACH ROW
BEGIN
    IF NEW.last_viewed_at > OLD.last_viewed_at THEN
        SET NEW.view_count = OLD.view_count + 1;
    END IF;
END//
DELIMITER ;

-- Trigger to calculate price change on insert
DELIMITER //
CREATE TRIGGER trg_calculate_price_change
BEFORE INSERT ON favorite_price_history
FOR EACH ROW
BEGIN
    DECLARE prev_price DECIMAL(10,2);
    
    SELECT price INTO prev_price
    FROM favorite_price_history
    WHERE favorite_id = NEW.favorite_id
    ORDER BY checked_at DESC
    LIMIT 1;
    
    IF prev_price IS NOT NULL THEN
        SET NEW.price_change = NEW.price - prev_price;
        SET NEW.price_change_percentage = ((NEW.price - prev_price) / prev_price) * 100;
    END IF;
END//
DELIMITER ;
```

## Migration Scripts

### Initial Schema Creation

```sql
-- Create favorite_vehicles table
CREATE TABLE favorite_vehicles (
    -- [Full table definition as shown above]
);

-- Create favorite_vehicle_alerts table
CREATE TABLE favorite_vehicle_alerts (
    -- [Full table definition as shown above]
);

-- Create favorite_vehicle_shares table
CREATE TABLE favorite_vehicle_shares (
    -- [Full table definition as shown above]
);

-- Create favorite_price_history table
CREATE TABLE favorite_price_history (
    -- [Full table definition as shown above]
);

-- Add check constraints
ALTER TABLE favorite_vehicles ADD CONSTRAINT chk_view_count CHECK (view_count >= 0);
ALTER TABLE favorite_vehicles ADD CONSTRAINT chk_date_order CHECK (preferred_return_date IS NULL OR preferred_pickup_date IS NULL OR preferred_return_date > preferred_pickup_date);
ALTER TABLE favorite_vehicle_shares ADD CONSTRAINT chk_access_count CHECK (access_count >= 0);
ALTER TABLE favorite_price_history ADD CONSTRAINT chk_price_positive CHECK (price > 0);
ALTER TABLE favorite_price_history ADD CONSTRAINT chk_currency_length CHECK (LENGTH(currency) = 3);

-- Create triggers
-- [Trigger definitions as shown above]
```

### Rollback Script

```sql
-- Drop triggers
DROP TRIGGER IF EXISTS trg_update_favorite_view;
DROP TRIGGER IF EXISTS trg_calculate_price_change;

-- Drop tables in reverse order (respecting foreign keys)
DROP TABLE IF EXISTS favorite_price_history;
DROP TABLE IF EXISTS favorite_vehicle_shares;
DROP TABLE IF EXISTS favorite_vehicle_alerts;
DROP TABLE IF EXISTS favorite_vehicles;
```

## Data Retention and Archival

### Retention Policies

**favorite_vehicles:**
- Soft delete inactive favorites after 1 year of no views
- Hard delete soft-deleted favorites after 2 years
- Retain active favorites indefinitely

**favorite_vehicle_alerts:**
- Retain alert history for 90 days
- Archive older alerts to cold storage table
- Retain aggregate statistics indefinitely

**favorite_vehicle_shares:**
- Automatically expire shares after configured duration (default 30 days)
- Delete expired and revoked shares after 90 days
- Retain share analytics (aggregated) indefinitely

**favorite_price_history:**
- Retain hourly price checks for 30 days
- Aggregate to daily averages after 30 days
- Retain daily aggregates for 2 years
- Retain monthly aggregates indefinitely

### Archival Queries

```sql
-- Archive old alerts
INSERT INTO favorite_vehicle_alerts_archive 
SELECT * FROM favorite_vehicle_alerts 
WHERE sent_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

DELETE FROM favorite_vehicle_alerts 
WHERE sent_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- Delete expired shares
DELETE FROM favorite_vehicle_shares 
WHERE (expires_at < DATE_SUB(NOW(), INTERVAL 90 DAY) OR is_revoked = TRUE)
AND last_accessed_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- Soft delete inactive favorites
UPDATE favorite_vehicles 
SET is_deleted = TRUE, deleted_at = NOW()
WHERE last_viewed_at < DATE_SUB(NOW(), INTERVAL 1 YEAR) 
AND is_deleted = FALSE;

-- Aggregate price history to daily averages
INSERT INTO favorite_price_history_daily (favorite_id, date, avg_price, min_price, max_price, check_count)
SELECT 
    favorite_id,
    DATE(checked_at) as date,
    AVG(price) as avg_price,
    MIN(price) as min_price,
    MAX(price) as max_price,
    COUNT(*) as check_count
FROM favorite_price_history
WHERE checked_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY favorite_id, DATE(checked_at);

DELETE FROM favorite_price_history
WHERE checked_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

## Performance Considerations

### Query Optimization

**Frequent Queries:**
1. Get user's active favorites: Use `idx_user_active` composite index
2. Check if vehicle is favorited: Use `uk_user_vehicle` unique index
3. Get alert history: Use `idx_favorite_type_sent` composite index
4. Resolve share token: Use `idx_share_token` unique index
5. Get price history: Use `idx_favorite_checked` composite index

**Slow Query Prevention:**
- Avoid full table scans on JSON columns
- Use generated columns for frequently queried JSON fields
- Implement pagination for large result sets (cursor-based)
- Use EXPLAIN ANALYZE to identify slow queries

### JSON Column Optimization

```sql
-- Add generated columns for frequently queried JSON fields
ALTER TABLE favorite_vehicles 
ADD COLUMN price_alert_enabled BOOLEAN 
GENERATED ALWAYS AS (JSON_EXTRACT(alert_preferences, '$.priceChangeEnabled')) STORED,
ADD INDEX idx_price_alert_enabled (price_alert_enabled);

ALTER TABLE favorite_vehicles 
ADD COLUMN availability_alert_enabled BOOLEAN 
GENERATED ALWAYS AS (JSON_EXTRACT(alert_preferences, '$.availabilityAlertEnabled')) STORED,
ADD INDEX idx_availability_alert_enabled (availability_alert_enabled);
```

### Partitioning Strategy

For high-volume deployments, consider partitioning large tables:

```sql
-- Partition favorite_vehicle_alerts by month
ALTER TABLE favorite_vehicle_alerts 
PARTITION BY RANGE (YEAR(sent_at) * 100 + MONTH(sent_at)) (
    PARTITION p202601 VALUES LESS THAN (202602),
    PARTITION p202602 VALUES LESS THAN (202603),
    PARTITION p202603 VALUES LESS THAN (202604),
    PARTITION pmax VALUES LESS THAN MAXVALUE
);

-- Partition favorite_price_history by month
ALTER TABLE favorite_price_history 
PARTITION BY RANGE (YEAR(checked_at) * 100 + MONTH(checked_at)) (
    PARTITION p202601 VALUES LESS THAN (202602),
    PARTITION p202602 VALUES LESS THAN (202603),
    PARTITION pmax VALUES LESS THAN MAXVALUE
);
```

## Security Considerations

### Data Protection

**Sensitive Data:**
- User notes may contain personal information
- Alert preferences reveal user behavior patterns
- Price history reveals booking intent
- Share access logs contain IP addresses

**Protection Measures:**
- Encrypt notes column if containing sensitive data
- Implement row-level security for multi-tenant scenarios
- Audit access to favorites and price history
- Anonymize IP addresses after 30 days
- Hash passwords for protected shares using bcrypt

### Access Control

**Database User Permissions:**
- Application user: SELECT, INSERT, UPDATE, DELETE on all tables
- Analytics user: SELECT only on alerts and price history tables
- Backup user: SELECT only on all tables
- Admin user: Full permissions for maintenance

### SQL Injection Prevention

- Use parameterized queries exclusively via ORM
- Validate and sanitize all user input
- Escape JSON string values properly
- Use stored procedures for complex operations

## Technology Stack

- **Database**: MySQL 8.0+ with InnoDB storage engine
- **Character Set**: utf8mb4 for full Unicode support (including emojis in notes)
- **Collation**: utf8mb4_unicode_ci for case-insensitive comparisons
- **Storage Engine**: InnoDB for ACID compliance and foreign key support
- **JSON Support**: Native JSON data type with validation and indexing

## Implementation Notes

### Initial Data Population

No initial data required. Tables start empty and populate as users add favorites.

### Testing Data

```sql
-- Insert test favorite
INSERT INTO favorite_vehicles (id, user_id, vehicle_id, notes, alert_preferences) 
VALUES (
    UUID(),
    'test-user-uuid',
    'test-vehicle-uuid',
    'Great car for family trips',
    '{"priceChangeEnabled": true, "priceChangeThreshold": 5.0, "availabilityAlertEnabled": true, "notificationChannels": ["email", "push"]}'
);

-- Insert test price history
INSERT INTO favorite_price_history (id, favorite_id, price, currency, checked_at)
VALUES (
    UUID(),
    'test-favorite-uuid',
    125.00,
    'USD',
    NOW()
);
```

### Monitoring Queries

```sql
-- Count favorites per user
SELECT user_id, COUNT(*) as favorite_count 
FROM favorite_vehicles 
WHERE is_deleted = FALSE 
GROUP BY user_id 
ORDER BY favorite_count DESC
LIMIT 10;

-- Most favorited vehicles
SELECT vehicle_id, COUNT(*) as favorite_count
FROM favorite_vehicles
WHERE is_deleted = FALSE
GROUP BY vehicle_id
ORDER BY favorite_count DESC
LIMIT 10;

-- Alert delivery success rate
SELECT 
    alert_type,
    COUNT(*) as total,
    SUM(CASE WHEN status IN ('delivered', 'opened', 'clicked') THEN 1 ELSE 0 END) as successful,
    ROUND(SUM(CASE WHEN status IN ('delivered', 'opened', 'clicked') THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) as success_rate
FROM favorite_vehicle_alerts 
WHERE sent_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY alert_type;

-- Price trends for favorites
SELECT 
    f.vehicle_id,
    v.name as vehicle_name,
    AVG(ph.price) as avg_price,
    MIN(ph.price) as min_price,
    MAX(ph.price) as max_price,
    COUNT(ph.id) as check_count
FROM favorite_vehicles f
JOIN vehicles v ON f.vehicle_id = v.id
JOIN favorite_price_history ph ON f.id = ph.favorite_id
WHERE ph.checked_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY f.vehicle_id, v.name
ORDER BY check_count DESC
LIMIT 10;
```
