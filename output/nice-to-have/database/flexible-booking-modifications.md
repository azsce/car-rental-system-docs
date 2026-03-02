# Feature: Flexible Booking Modifications (Database)

## Overview

Database schema and structures to support booking modifications including tracking modification history, storing before/after values, managing payment transactions, and maintaining audit trails for all booking changes.

## Sprint Category

nice-to-have

## Feature ID

F-BM-008

## Schema Changes

### New Tables

**booking_modifications** - Comprehensive tracking of all booking modifications

### Modified Tables

**bookings** - Add modification tracking columns

## Table Definitions

### booking_modifications

Stores complete history of all modifications made to bookings with before/after values for audit and dispute resolution.

```sql
CREATE TABLE booking_modifications (
  -- Primary identification
  modification_id VARCHAR(36) PRIMARY KEY COMMENT 'Unique modification identifier (UUID)',
  booking_id VARCHAR(36) NOT NULL COMMENT 'Reference to modified booking',
  modified_by_user_id VARCHAR(36) NOT NULL COMMENT 'User who made the modification',
  modification_type ENUM('dates', 'vehicle', 'location', 'services', 'multiple') NOT NULL COMMENT 'Type of modification',
  modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When modification was made',
  
  -- Original booking values (before modification)
  original_pickup_date DATETIME COMMENT 'Original pickup date and time',
  original_return_date DATETIME COMMENT 'Original return date and time',
  original_vehicle_id VARCHAR(36) COMMENT 'Original vehicle ID',
  original_pickup_location_id VARCHAR(36) COMMENT 'Original pickup location',
  original_return_location_id VARCHAR(36) COMMENT 'Original return location',
  original_services JSON COMMENT 'Original additional services array',
  original_total_cost DECIMAL(10,2) COMMENT 'Original total booking cost',
  
  -- New booking values (after modification)
  new_pickup_date DATETIME COMMENT 'New pickup date and time',
  new_return_date DATETIME COMMENT 'New return date and time',
  new_vehicle_id VARCHAR(36) COMMENT 'New vehicle ID',
  new_pickup_location_id VARCHAR(36) COMMENT 'New pickup location',
  new_return_location_id VARCHAR(36) COMMENT 'New return location',
  new_services JSON COMMENT 'New additional services array',
  new_total_cost DECIMAL(10,2) COMMENT 'New total booking cost',
  
  -- Financial impact
  cost_difference DECIMAL(10,2) COMMENT 'Difference between new and original cost (positive = additional charge)',
  modification_fee DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Fee charged for modification',
  refund_amount DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Amount refunded if cost decreased',
  additional_payment DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Additional payment if cost increased',
  payment_status ENUM('pending', 'processed', 'failed', 'refunded') DEFAULT 'pending' COMMENT 'Payment processing status',
  payment_transaction_id VARCHAR(100) COMMENT 'Payment gateway transaction ID',
  
  -- Metadata and audit
  reason TEXT COMMENT 'Customer-provided reason for modification',
  notes TEXT COMMENT 'Internal notes or system-generated comments',
  ip_address VARCHAR(45) COMMENT 'IP address of user making modification',
  user_agent TEXT COMMENT 'Browser user agent string',
  
  -- Constraints and indexes
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
  FOREIGN KEY (modified_by_user_id) REFERENCES users(user_id),
  
  INDEX idx_booking_modifications (booking_id, modified_at DESC),
  INDEX idx_user_modifications (modified_by_user_id, modified_at DESC),
  INDEX idx_modification_type (modification_type, modified_at DESC),
  INDEX idx_payment_status (payment_status, modified_at),
  INDEX idx_modified_at (modified_at)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tracks all modifications made to bookings with complete before/after audit trail';
```

### bookings Table Modifications

Add columns to track modification metadata on the main bookings table.

```sql
ALTER TABLE bookings
ADD COLUMN last_modified_at TIMESTAMP NULL COMMENT 'Timestamp of most recent modification',
ADD COLUMN modification_count INT DEFAULT 0 COMMENT 'Total number of modifications made',
ADD COLUMN modification_fees_total DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Sum of all modification fees',
ADD INDEX idx_last_modified (last_modified_at),
ADD INDEX idx_modification_count (modification_count);
```

## Relationships

### booking_modifications → bookings

**Relationship Type**: Many-to-One

**Description**: Each modification record belongs to exactly one booking. A booking can have multiple modifications over its lifetime.

**Foreign Key**: `booking_id` references `bookings(booking_id)`

**Cascade Behavior**: ON DELETE CASCADE - When a booking is deleted, all associated modification records are automatically deleted to maintain referential integrity.

**Business Rules**:
- A booking can have 0 to N modifications
- Modifications are ordered chronologically by `modified_at`
- The most recent modification represents the current booking state
- Historical modifications provide audit trail

### booking_modifications → users

**Relationship Type**: Many-to-One

**Description**: Each modification is made by exactly one user. A user can make multiple modifications across different bookings.

**Foreign Key**: `modified_by_user_id` references `users(user_id)`

**Cascade Behavior**: No cascade - User records are preserved even if they made modifications

**Business Rules**:
- User must be authenticated to make modifications
- User must be booking owner or authorized delegate
- User ID is logged for audit and accountability

### booking_modifications → vehicles (Indirect)

**Relationship Type**: Indirect reference (no foreign key constraint)

**Description**: Modifications reference original and new vehicle IDs but do not enforce foreign key constraints to preserve historical data even if vehicles are deleted or deactivated.

**Fields**: `original_vehicle_id`, `new_vehicle_id`

**Business Rules**:
- Vehicle IDs stored as strings for historical reference
- No cascade behavior - modifications preserved even if vehicle deleted
- Allows reporting on vehicle change patterns

### booking_modifications → locations (Indirect)

**Relationship Type**: Indirect reference (no foreign key constraint)

**Description**: Modifications reference original and new location IDs without foreign key constraints to maintain modification history.

**Fields**: `original_pickup_location_id`, `original_return_location_id`, `new_pickup_location_id`, `new_return_location_id`

**Business Rules**:
- Location IDs stored for historical tracking
- Modifications preserved even if location closed or deleted
- Enables analysis of location change patterns

## Indexes

### Primary Indexes

**Primary Key Index**
```sql
PRIMARY KEY (modification_id)
```
- Ensures unique modification identifier
- Clustered index for fast lookups by modification ID
- UUID format for global uniqueness

### Performance Optimization Indexes

**Booking Modifications Lookup** (Most Common Query)
```sql
CREATE INDEX idx_booking_modifications 
ON booking_modifications(booking_id, modified_at DESC);
```
- Optimizes queries to retrieve all modifications for a booking
- Sorted by date descending to show most recent first
- Covers the most frequent access pattern
- Estimated usage: 80% of queries

**User Modifications History**
```sql
CREATE INDEX idx_user_modifications 
ON booking_modifications(modified_by_user_id, modified_at DESC);
```
- Enables fast lookup of all modifications by a specific user
- Useful for user activity tracking and audit
- Supports admin dashboards showing user modification patterns

**Modification Type Analysis**
```sql
CREATE INDEX idx_modification_type 
ON booking_modifications(modification_type, modified_at DESC);
```
- Optimizes queries filtering by modification type
- Enables reporting on most common modification types
- Supports business intelligence queries

**Payment Status Tracking**
```sql
CREATE INDEX idx_payment_status 
ON booking_modifications(payment_status, modified_at);
```
- Fast lookup of pending or failed payment modifications
- Enables automated retry of failed payments
- Supports financial reconciliation processes

**Temporal Index**
```sql
CREATE INDEX idx_modified_at 
ON booking_modifications(modified_at);
```
- Optimizes date range queries
- Supports reporting by time period
- Enables time-series analysis of modification patterns

### Composite Indexes for Reporting

**Comprehensive Reporting Index**
```sql
CREATE INDEX idx_reporting 
ON booking_modifications(modified_at, modification_type, payment_status);
```
- Optimizes complex reporting queries
- Supports multi-dimensional analysis
- Enables efficient aggregation queries
- Example query: "Show all date modifications with processed payments in last 30 days"

**Cost Analysis Index**
```sql
CREATE INDEX idx_cost_analysis 
ON booking_modifications(modification_type, cost_difference, modified_at);
```
- Optimizes financial impact analysis
- Supports revenue reporting from modifications
- Enables identification of high-value modifications

## Data Integrity Constraints

### Check Constraints

**Date Validation**
```sql
ALTER TABLE booking_modifications
ADD CONSTRAINT chk_dates_logical 
CHECK (
  (original_pickup_date IS NULL OR original_return_date IS NULL) OR 
  (original_return_date >= original_pickup_date)
);

ALTER TABLE booking_modifications
ADD CONSTRAINT chk_new_dates_logical 
CHECK (
  (new_pickup_date IS NULL OR new_return_date IS NULL) OR 
  (new_return_date >= new_pickup_date)
);
```

**Financial Validation**
```sql
ALTER TABLE booking_modifications
ADD CONSTRAINT chk_financial_consistency 
CHECK (
  (cost_difference >= 0 AND additional_payment >= 0 AND refund_amount = 0) OR
  (cost_difference <= 0 AND refund_amount >= 0 AND additional_payment = 0) OR
  (cost_difference = 0 AND additional_payment = 0 AND refund_amount = 0)
);
```

**Modification Fee Validation**
```sql
ALTER TABLE booking_modifications
ADD CONSTRAINT chk_modification_fee_positive 
CHECK (modification_fee >= 0);
```

### Triggers

**Update Booking Modification Metadata**
```sql
DELIMITER //

CREATE TRIGGER trg_update_booking_modification_count
AFTER INSERT ON booking_modifications
FOR EACH ROW
BEGIN
  UPDATE bookings
  SET 
    last_modified_at = NEW.modified_at,
    modification_count = modification_count + 1,
    modification_fees_total = modification_fees_total + NEW.modification_fee
  WHERE booking_id = NEW.booking_id;
END//

DELIMITER ;
```

**Audit Trail Trigger**
```sql
DELIMITER //

CREATE TRIGGER trg_modification_audit
AFTER INSERT ON booking_modifications
FOR EACH ROW
BEGIN
  INSERT INTO audit_log (
    entity_type,
    entity_id,
    action,
    user_id,
    timestamp,
    details
  ) VALUES (
    'booking_modification',
    NEW.modification_id,
    'CREATE',
    NEW.modified_by_user_id,
    NEW.modified_at,
    JSON_OBJECT(
      'booking_id', NEW.booking_id,
      'modification_type', NEW.modification_type,
      'cost_difference', NEW.cost_difference
    )
  );
END//

DELIMITER ;
```

## Query Patterns

### Retrieve Modification History for Booking

```sql
SELECT 
  m.modification_id,
  m.modification_type,
  m.modified_at,
  u.first_name,
  u.last_name,
  u.email,
  m.original_pickup_date,
  m.new_pickup_date,
  m.original_return_date,
  m.new_return_date,
  m.cost_difference,
  m.modification_fee,
  m.payment_status
FROM booking_modifications m
JOIN users u ON m.modified_by_user_id = u.user_id
WHERE m.booking_id = ?
ORDER BY m.modified_at DESC;
```

### Find Pending Payment Modifications

```sql
SELECT 
  m.modification_id,
  m.booking_id,
  m.modified_at,
  m.additional_payment,
  m.payment_transaction_id,
  b.customer_email
FROM booking_modifications m
JOIN bookings b ON m.booking_id = b.booking_id
WHERE m.payment_status = 'pending'
  AND m.modified_at < DATE_SUB(NOW(), INTERVAL 1 HOUR)
ORDER BY m.modified_at ASC
LIMIT 100;
```

### Modification Statistics by Type

```sql
SELECT 
  modification_type,
  COUNT(*) as total_modifications,
  AVG(cost_difference) as avg_cost_impact,
  SUM(modification_fee) as total_fees_collected,
  COUNT(CASE WHEN payment_status = 'processed' THEN 1 END) as successful_payments,
  COUNT(CASE WHEN payment_status = 'failed' THEN 1 END) as failed_payments
FROM booking_modifications
WHERE modified_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY modification_type
ORDER BY total_modifications DESC;
```

### High-Value Modifications Report

```sql
SELECT 
  m.modification_id,
  m.booking_id,
  m.modified_at,
  m.modification_type,
  m.cost_difference,
  m.additional_payment,
  u.email as modified_by,
  b.customer_email
FROM booking_modifications m
JOIN users u ON m.modified_by_user_id = u.user_id
JOIN bookings b ON m.booking_id = b.booking_id
WHERE m.additional_payment > 200.00
  AND m.payment_status = 'processed'
  AND m.modified_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY m.additional_payment DESC;
```

### User Modification Activity

```sql
SELECT 
  u.user_id,
  u.email,
  COUNT(m.modification_id) as total_modifications,
  SUM(m.modification_fee) as total_fees_paid,
  MAX(m.modified_at) as last_modification,
  AVG(m.cost_difference) as avg_cost_impact
FROM users u
JOIN booking_modifications m ON u.user_id = m.modified_by_user_id
WHERE m.modified_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
GROUP BY u.user_id, u.email
HAVING total_modifications > 3
ORDER BY total_modifications DESC;
```

## Data Retention and Archival

### Retention Policy

**Active Modifications**: Retain indefinitely for audit and dispute resolution

**Completed Bookings**: Retain modification history for 7 years for legal compliance

**Cancelled Bookings**: Retain modification history for 3 years

### Archival Strategy

```sql
-- Archive old modifications to separate table
CREATE TABLE booking_modifications_archive LIKE booking_modifications;

-- Move modifications older than 3 years for cancelled bookings
INSERT INTO booking_modifications_archive
SELECT m.*
FROM booking_modifications m
JOIN bookings b ON m.booking_id = b.booking_id
WHERE b.status = 'cancelled'
  AND m.modified_at < DATE_SUB(NOW(), INTERVAL 3 YEAR);

-- Delete archived records from main table
DELETE m
FROM booking_modifications m
JOIN bookings b ON m.booking_id = b.booking_id
WHERE b.status = 'cancelled'
  AND m.modified_at < DATE_SUB(NOW(), INTERVAL 3 YEAR);
```

## Backup and Recovery

### Backup Strategy

- Full database backup daily
- Incremental backups every 6 hours
- Transaction log backups every 15 minutes
- Point-in-time recovery capability

### Critical Data Protection

```sql
-- Create backup before bulk modifications
CREATE TABLE booking_modifications_backup_20260223 
SELECT * FROM booking_modifications;

-- Verify backup
SELECT COUNT(*) FROM booking_modifications_backup_20260223;
```

## Performance Considerations

### Table Partitioning

For high-volume systems, consider partitioning by modification date:

```sql
ALTER TABLE booking_modifications
PARTITION BY RANGE (YEAR(modified_at)) (
  PARTITION p2024 VALUES LESS THAN (2025),
  PARTITION p2025 VALUES LESS THAN (2026),
  PARTITION p2026 VALUES LESS THAN (2027),
  PARTITION p_future VALUES LESS THAN MAXVALUE
);
```

### Query Optimization Tips

- Use covering indexes for frequently accessed columns
- Avoid SELECT * - specify only needed columns
- Use LIMIT for pagination
- Consider materialized views for complex reporting queries
- Monitor slow query log and optimize problematic queries

### Index Maintenance

```sql
-- Analyze table statistics monthly
ANALYZE TABLE booking_modifications;

-- Optimize table quarterly
OPTIMIZE TABLE booking_modifications;

-- Check index usage
SELECT 
  TABLE_NAME,
  INDEX_NAME,
  SEQ_IN_INDEX,
  COLUMN_NAME,
  CARDINALITY
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_NAME = 'booking_modifications'
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;
```

## Technology Stack

- **Database**: MySQL 8.0+
- **Storage Engine**: InnoDB (ACID compliance, foreign keys, transactions)
- **Character Set**: utf8mb4 (full Unicode support including emojis)
- **Collation**: utf8mb4_unicode_ci (case-insensitive, accent-sensitive)
- **Transaction Isolation**: READ COMMITTED (default)

## Implementation Notes

### Migration Strategy

1. Create `booking_modifications` table in staging environment
2. Test with sample data
3. Create indexes
4. Test query performance
5. Deploy to production during maintenance window
6. Monitor performance metrics
7. Adjust indexes based on actual usage patterns

### Data Migration

If migrating from existing system:

```sql
-- Migrate existing modification data
INSERT INTO booking_modifications (
  modification_id,
  booking_id,
  modified_by_user_id,
  modification_type,
  modified_at,
  -- map other fields
)
SELECT 
  UUID(),
  old_booking_id,
  old_user_id,
  'multiple',
  old_modified_date,
  -- map other fields
FROM legacy_modifications;
```

### Monitoring and Alerts

- Monitor table size growth
- Alert on high modification failure rates
- Track average modification processing time
- Monitor payment processing success rates
- Alert on unusual modification patterns (potential fraud)
